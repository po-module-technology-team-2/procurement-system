# Phân hệ 03: Work Order phục vụ Báo giá (Work Order for Quotation)

Nhóm API quản lý các Work Order chuyên biệt đóng vai trò là **vỏ bọc hồ sơ kỹ thuật** để xin báo giá linh kiện cho thiết bị (Loại `workOrderType: 12` - `PR` / `[PRE-RFQ]RFQ`).

---

### Nguyên lý Vận hành

Mọi linh kiện cần hỏi giá nhà cung cấp đều phải được ràng buộc vào một máy/thiết bị trong xưởng thông qua Work Order Type 12:

```
[Máy / Asset M1618-4844323] 
   └── [Work Order: WO-250280720 (Type 12: PR)] 
          └── [Linh kiện / Q-Code: QDAD13270] 
                 └── [Hồ sơ Báo giá: Pre-Estimate Created (P003)]
```

---

### Danh sách API Endpoints

#### 1. `retrieveWipEntity.lgdn`
- **Đường dẫn**: `/emscom/woSearchNav/retrieveWipEntity.lgdn`
- **Method**: `POST`
- **Request Dataset**:
  - `ds_input`: `wipEntityId`
- **Response Dataset**:
  - `ds_output`: `wipEntityName`, `wipEntityId`, `workOrderType` (giá trị: `12`), `workOrderTypeDesc` (`PR`), `statusTypeDisp` (`Unreleased`)
- **Nghiệp vụ**: Xác thực sự tồn tại và loại hình của Work Order báo giá.

#### 2. `WoMasterRetInit.lgdn`
- **Đường dẫn**: `/emscom/woMasterNav/WoMasterRetInit.lgdn`
- **Method**: `POST`
- **Request Dataset**:
  - `ds_info`: `wipEntityId`, `organizationId`, `userId`, `txnType: ViewWO`
- **Response Datasets**:
  - `ds_wo`: Thông tin Master liên kết (`assetGroup: M1618`, `equipGrpDesc: MODULE_MANUAL LASER MARKING`, `assetNumber`, `owningDepartment: 87473`, `budgetDeptDesc`, `description: [QDAD13270][PRE-RFQ]RFQ`, `statusTypeDisp`)
  - `ds_step`: Trạng thái luồng xử lý (`x_return_status: OK`)
  - `ds_spAttachFile`: Số lượng file đính kèm
- **Nghiệp vụ**: Lấy toàn bộ thông tin gốc của thiết bị, phòng ban chịu chi phí và mô tả yêu cầu báo giá.

#### 3. `WO230WoSaveInit.lgdn`
- **Đường dẫn**: `/emsworkorder/wo20/wo230Nav/WO230WoSaveInit.lgdn`
- **Method**: `POST`
- **Request Dataset**:
  - `ds_info`: `wipEntityId`, `organizationId`, `userId`, `command: WoInit`
- **Response Datasets**:
  - `ds_mtlist`: Danh sách vật tư gắn với WO báo giá (`itemName: QCode`, `itemDesc`, `quantity`, `uom`, `onHandQty`, `availableQty`, `price`, `fdmUrl` - link bản vẽ kỹ thuật)
  - `ds_oplist`: Các công đoạn dự kiến (`operationSeqNum`, `standardOperationCode`)
  - `ds_init`: Các cờ thiết lập (`useAllocationFlag`, `safetyFlag`)
- **Nghiệp vụ**: Màn hình WO230 - Khởi tạo và nạp dữ liệu chi tiết vật tư phục vụ mua sắm gắn với Work Order.

#### 4. `statusHistory.lgdn`
- **Đường dẫn**: `/emsworkorder/wo50/wo580Nav/statusHistory.lgdn`
- **Method**: `POST`
- **Response Dataset**:
  - `ds_list`: Lịch sử trạng thái và trao đổi (`wipEntityId`, `historyId`, `commentText`, `status`, `lastUpdatedByName`, `creationDate`)
- **Nghiệp vụ**: Màn hình WO580 - Nhật ký truy vết toàn bộ quá trình xin giá, duyệt giá hoặc lý do hủy báo giá giữa kỹ sư và buyer.
