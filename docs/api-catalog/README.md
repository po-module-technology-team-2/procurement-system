# API Catalog Index — Nexacro EMS API Specifications

Tài liệu này tổng hợp và phân loại toàn bộ **31 Nexacro API endpoints** (166 lượt gọi) được ghi nhận trong tệp trace `nexacro_api_...yaml`.

---

## 📂 Danh mục Phân loại Thư mục

| Thư mục | Tên phân hệ | Số lượng API | Vai trò chính |
|---|---|:---:|---|
| [`01-inventory-and-spare-parts/`](./01-inventory-and-spare-parts/) | **Quản lý Kho & Vật tư** | 4 APIs | Tra cứu tồn kho, định mức an toàn, tiêu hao lịch sử và hồ sơ QCode linh kiện |
| [`02-procurement-and-quotation/`](./02-procurement-and-quotation/) | **Mua sắm & Báo giá (RFQ)** | 7 APIs | Sinh mã PRV, gửi báo giá (RFQ), đơn mua khẩn cấp (Emergency PO), luân chuyển vật tư |
| [`03-work-order-quotation/`](./03-work-order-quotation/) | **Work Order phục vụ Báo giá** | 4 APIs | Quản lý WO Type 12 (PR / Pre-RFQ Work Order) liên kết máy với linh kiện cần báo giá |
| [`04-master-data-and-lookups/`](./04-master-data-and-lookups/) | **Danh mục Dùng chung & Popup** | 4 APIs | Common codes (18 loại), popup nhân viên, phòng ban phụ trách ngân sách |
| [`05-session-and-system-infra/`](./05-session-and-system-infra/) | **Hạ tầng Nexacro & Logging** | 12 APIs | Đăng nhập phiên, cấp quyền Menu (173 màn hình), lưu Grid Format và đo đạc log |

---

## 🗺️ Bản đồ Tương tác Nghiệp vụ giữa các Nhóm API

```mermaid
graph TD
    subgraph S5["05-session-and-system-infra"]
        Login["login.lgdn<br/>(UserInfo + Responsibility + MenuList)"]
        AuthBtn["getAuthButton.lgdn<br/>(RFQ / Emergency Auth)"]
    end

    subgraph S4["04-master-data-and-lookups"]
        ComCode["retComCodeList.lgdn<br/>(Status, UOM, WO Types)"]
        DeptEmp["retrieveDepartment / retrieveEmployee.lgdn"]
    end

    subgraph S1["01-inventory-and-spare-parts"]
        Stock["RetStockStatusList.lgdn<br/>(Tồn kho khả dụng & Onhand)"]
        Detail["retrieveItemInfoDetail.lgdn<br/>(360° QCode, Bản vẽ FDM, Tiêu hao 2 năm)"]
    end

    subgraph S3["03-work-order-quotation"]
        WipSearch["retrieveWipEntity.lgdn"]
        WoMaster["WoMasterRetInit.lgdn<br/>(Liên kết WO Type 12 với Asset máy)"]
        WoMaterials["WO230WoSaveInit.lgdn<br/>(Gắn linh kiện QCode vào WO)"]
    end

    subgraph S2["02-procurement-and-quotation"]
        MasterId["RetRequestMasterId.lgdn<br/>(Khởi tạo mã yêu cầu)"]
        RFQ["CreInsertRfqIntoRequest.lgdn / RetEstimateRequestList.lgdn"]
        PrvMain["retrieveItemBuyMainList.lgdn<br/>(Duyệt PRV & Báo giá)"]
        Emrg["EmergencyPoList.lgdn<br/>(Đơn khẩn cấp)"]
    end

    Login --> AuthBtn
    Login --> ComCode
    Stock --> Detail
    Detail -->|Thiếu vật tư| MasterId
    MasterId --> WoMaster
    WoMaster --> WoMaterials
    WoMaterials --> RFQ
    RFQ --> PrvMain
```
