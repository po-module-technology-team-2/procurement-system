# Phân hệ 04: Danh mục Dùng chung & Popup (Master Data & Lookups)

Nhóm API cung cấp dữ liệu nền tảng cho toàn bộ hệ thống: mã danh mục dùng chung (Common Codes), danh sách nhân viên, phòng ban phân xưởng và phòng ban ngân sách.

---

### Danh sách API Endpoints

#### 1. `retComCodeList.lgdn`
- **Đường dẫn**: `/emscom/codeNav/retComCodeList.lgdn`
- **Method**: `POST`
- **Request Dataset**:
  - `ds_input0` .. `ds_input4`: Mã phân hệ, nhóm dữ liệu cần lấy
- **Response Datasets**:
  - `ds_output0` .. `ds_output7`: Danh sách mã (`comCode`, `comCodeDesc`, `seqNo`, `enabledFlag`)
- **Nghiệp vụ**: Cung cấp danh mục dùng chung cho toàn hệ thống:
  - Phân loại Work Order: `BM`, `PM`, `CM`, `PR`, `UD`, `PD`,...
  - Phân loại trạng thái báo giá: `P002: Pre-Estimate Requested`, `P003: Pre-Estimate Created`, `P004: Pre-Estimate Confirmed`, `P005: PR Created`
  - Đơn vị tính, nhóm ưu tiên, cấp độ khẩn cấp.

#### 2. `retrieveDepartment.lgdn`
- **Đường dẫn**: `/emscom/popupNav/retrieveDepartment.lgdn`
- **Method**: `POST`
- **Response Dataset**:
  - `ds_List`: Danh sách phòng ban (`hrDepartmentCode`, `hrDepartmentName`, `budgetType`, `chkFlag`)
- **Nghiệp vụ**: Popup tìm kiếm phòng ban nhân sự và phòng ban phê duyệt chi phí.

#### 3. `retrieveOwingDepartment.lgdn`
- **Đường dẫn**: `/emscom/popupNav/retrieveOwingDepartment.lgdn`
- **Method**: `POST`
- **Response Dataset**:
  - `ds_List`: Danh sách phòng ban sở hữu thiết bị (`departmentCode`, `description`, `budgetDeptCode`, `budgetDeptDesc`)
- **Nghiệp vụ**: Popup liên kết phòng ban quản lý máy với bộ phận ngân sách chịu trách nhiệm chi trả.

#### 4. `retrieveEmployee.lgdn`
- **Đường dẫn**: `/emscom/popupNav/retrieveEmployee.lgdn`
- **Method**: `POST`
- **Response Dataset**:
  - `ds_List`: Danh sách nhân viên (`personId`, `userId`, `employeeName`, `employeeNo`, `department`, `emailAddress`, `phoneNo`, `titleName`)
- **Nghiệp vụ**: Popup tra cứu danh bạ nhân sự để gán người phụ trách yêu cầu (Requestor) hoặc người phê duyệt (Approver).
