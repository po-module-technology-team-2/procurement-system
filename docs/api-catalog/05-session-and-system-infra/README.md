# Phân hệ 05: Hạ tầng Nexacro & Logging (Session, Layout & Logging)

Nhóm API phục vụ xác thực người dùng, phân quyền truy cập chức năng, cấu hình giao diện bảng biểu và đo đạc giám sát hiệu năng phiên kết nối Nexacro.

---

### Danh sách API Endpoints

#### 1. `login.lgdn`
- **Đường dẫn**: `/emscom/loginNav/login.lgdn`
- **Method**: `POST`
- **Response Datasets**:
  - `ds_UserInfo`: Hồ sơ cá nhân người đăng nhập (`userId`, `employeeNumber`, `employeeName`, `departmentCode`, `defaultOrgId: 28753`, `letsId`)
  - `ds_Responsibility`: Nhóm quyền/vai trò (`responsibilityKey`, `responsibilityName`, `responsibilityGroup: PLANNER, SCHEDULER, TECHNICIAN`)
  - `ds_MenuList`: Cây danh mục 173 màn hình chức năng của hệ thống EMS
  - `ds_trItrList`: Danh sách URL định tuyến form
- **Nghiệp vụ**: Xác thực đăng nhập vào hệ thống EMS Nexacro và cấp nạp cấu hình menu phân quyền.

#### 2. `getAuthButton.lgdn`
- **Đường dẫn**: `/emscom/authButtonNav/getAuthButton.lgdn`
- **Method**: `POST`
- **Response Dataset**:
  - `ds_auth`: Cờ phân quyền hiển thị nút thao tác (`orgRfqFlag`, `orgEmrgFlag`, `orgPublicFlag`, `commonMgrFlag`, `rebMgrFlag`)
- **Nghiệp vụ**: Kiểm tra quyền hạn của tài khoản trên từng màn hình cụ thể (Ví dụ: có quyền bấm nút duyệt đơn khẩn cấp hoặc gửi RFQ hay không).

#### 3. `retrieveGridFormat.lgdn`
- **Đường dẫn**: `/emscom/gridFormatNav/retrieveGridFormat.lgdn`
- **Method**: `POST`
- **Request Dataset**:
  - `ds_search`: `programId`, `screenGridName`, `userId`
- **Response Dataset**:
  - `ds_list`: Cấu hình format hiển thị bảng dữ liệu (Grid XML layout, độ rộng cột, ẩn/hiện cột)
- **Nghiệp vụ**: Nạp và lưu cấu hình tùy biến bảng biểu theo sở thích của từng người dùng.

#### 4. `retrieveUnPrcsTotal.lgdn`
- **Đường dẫn**: `/emsreport/rp70/rp710Nav/retrieveUnPrcsTotal.lgdn`
- **Method**: `POST`
- **Response Dataset**:
  - `ds_result`: Trả về số lượng `totalCnt` các việc còn tồn đọng cần phê duyệt.
- **Nghiệp vụ**: Hiển thị số lượng badge thông báo trên thanh tiêu đề của người dùng.

#### 5. `insertStartLog.lgdn` & `updateEndLog.lgdn`
- **Đường dẫn**: `/emscom/connLogNav/insertStartLog.lgdn` & `/emscom/connLogNav/updateEndLog.lgdn`
- **Method**: `POST`
- **Nghiệp vụ**: Cặp API đo đạc hiệu năng: ghi nhận thời gian bắt đầu gọi action trên giao diện Nexacro và thời gian máy chủ hoàn tất xử lý để phục vụ giám sát kỹ thuật (Performance Monitoring).

#### 6. Các API Hỗ trợ & Dịch vụ EDMS
- **`retrieveBoardFile.lgdn`**: Tải thông báo bảng tin đăng nhập và banner hình ảnh.
- **`/edms/contextMenu/listContextMenu.jsp`**: Menu chuột phải trên hệ thống quản lý tài liệu điện tử EDMS.
- **`/Servlet/CloudFolderTree.map`**: Cây thư mục lưu trữ tài liệu kỹ thuật trên Cloud Server.
- **`/Servlet/MessageClient.admin` & `/Servlet/MenuPermit.document`**: Dịch vụ thông báo và kiểm tra giấy phép phiên làm việc.
