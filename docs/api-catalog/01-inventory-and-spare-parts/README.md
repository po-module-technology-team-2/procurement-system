# Phân hệ 01: Quản lý Kho & Vật tư (Inventory & Spare Parts)

Nhóm API phục vụ tra cứu thông tin tồn kho, số lượng khả dụng, định mức tồn an toàn và hồ sơ thông số kỹ thuật 360° của linh kiện/vật tư.

---

### Danh sách API Endpoints

#### 1. `RetStockStatusList.lgdn`
- **Đường dẫn**: `/emsspareparts/sp101/sp110Nav/RetStockStatusList.lgdn`
- **Method**: `POST`
- **Request Dataset**:
  - `ds_search`: `organizationId`, `itemId`, `commonFlag`, `periodicFlag`, `itemDesc`, `maker`, `stockDept`, `poInterlock`
- **Response Datasets**:
  - `ds_result`: Danh sách tồn kho vật tư (`inventoryItemId`, `item`, `itemDesc`, `onhandQty`, `availableQty`, `safetyStockQty`, `makerPart`, `unitPrice`, `poInterlock`)
  - `ds_ItemInfo`: Thông tin rút gọn vật tư
- **Nghiệp vụ**: Màn hình tìm kiếm tổng thể tồn kho (SP110). Được hệ thống gọi trước khi quyết định đề xuất mua sắm.

#### 2. `retrieveItemInfoDetail.lgdn`
- **Đường dẫn**: `/emsspareparts/sp102/sp135Nav/retrieveItemInfoDetail.lgdn`
- **Method**: `POST`
- **Request Dataset**:
  - `ds_Input`: `organizationId`, `inventoryItemId`, `requestCode`, `requestMasterId`
- **Response Datasets**:
  - `ds_Item`: Hồ sơ kỹ thuật (`item`, `description`, `uomCode`, `maker`, `makerPart`, `catalogGroup`, `fdmUrl` - liên kết bản vẽ Windchill PLM)
  - `ds_Inv`: Tồn kho đa chiều (`reviewQty`, `targetQty`, `safetyStockQty`, `userQty`, `poWaitingQty`)
  - `ds_Summary`: Dữ liệu phân tích tiêu hao (`monthAvgUsage2y`, `monthAvgUsage1y`, `monthAvgUsage3m`, `lastMonthIssueQty`, `thisMonthIssueQty`, `onceAvgIssueQty`, `onceMaxIssueQty`)
- **Nghiệp vụ**: Chi tiết linh kiện SP135. Cung cấp bức tranh toàn cảnh để thẩm định nhu cầu mua sắm.

#### 3. `GetOptimizeInfo.lgdn`
- **Đường dẫn**: `/emsspareparts/sp302/sp330Nav/GetOptimizeInfo.lgdn`
- **Method**: `POST`
- **Request Dataset**:
  - `ds_search`: `organizationId`, `itemId`
- **Response Datasets**:
  - `ds_rtn`: `optimizeFlag`, `optimizedApplyDate`
- **Nghiệp vụ**: Kiểm tra cờ tối ưu hóa định mức tồn kho (Target Stock Optimization Flag).

#### 4. `retrieveItemPoStatusList.lgdn`
- **Đường dẫn**: `/emscom/popupNav/retrieveItemPoStatusList.lgdn`
- **Method**: `POST`
- **Request Dataset**:
  - `ds_Search`: `inventoryItemId`, `organizationId`
- **Response Datasets**:
  - `ds_Rtn`: `item`, `disuseInventoryFlag`, `agingInterlockFlag`, `unitPriceStatusCode`, `buyerId`
- **Nghiệp vụ**: Popup cảnh báo trạng thái mua hàng, kiểm tra vật tư bị khóa liên kết (Interlock), vật tư tồn đọng lâu năm (Aging).
