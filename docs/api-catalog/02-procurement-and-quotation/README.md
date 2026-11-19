# Phân hệ 02: Mua sắm & Báo giá (Procurement & Quotation)

Nhóm API quản lý vòng đời yêu cầu báo giá linh kiện (RFQ), mua hàng định kỳ, mua khẩn cấp và đối soát giá liên nhà máy (Cross-site).

---

### Danh sách API Endpoints

#### 1. `RetRequestMasterId.lgdn`
- **Đường dẫn**: `/emscom/seqNav/RetRequestMasterId.lgdn`
- **Method**: `POST`
- **Response Dataset**:
  - `ds_result`: Trả về `requestMasterId` mới (Khóa chính định danh cho phiên mua sắm/báo giá).
- **Nghiệp vụ**: Bước đầu tiên khi khởi tạo một đợt đăng ký mua hàng mới.

#### 2. `CreInsertRfqIntoRequest.lgdn`
- **Đường dẫn**: `/emsspareparts/sp101/sp110Nav/CreInsertRfqIntoRequest.lgdn`
- **Method**: `POST`
- **Request Dataset**:
  - `ds_search`: Đẩy danh sách các mã linh kiện thiếu hụt vào phiên yêu cầu báo giá.
- **Nghiệp vụ**: Thêm các hạng mục cần hỏi giá (Pre-RFQ) vào phiên yêu cầu.

#### 3. `RetEstimateRequestList.lgdn`
- **Đường dẫn**: `/emsspareparts/sp101/sp120Nav/RetEstimateRequestList.lgdn`
- **Method**: `POST`
- **Response Dataset**:
  - `ds_list`: Danh sách yêu cầu dự toán giá (`prvNo`, `estimateRequestDate`, `budgetDept`, `supplier`, `estimateStatus`)
- **Nghiệp vụ**: Theo dõi trạng thái tiến độ báo giá từ các nhà cung cấp theo mã phòng ban ngân sách.

#### 4. `retrieveItemBuyMainList.lgdn`
- **Đường dẫn**: `/emsspareparts/sp102/sp130Nav/retrieveItemBuyMainList.lgdn`
- **Method**: `POST`
- **Response Datasets**:
  - `ds_list`: Danh sách PRV mua hàng chính (`prvNo`, `prvStatus`, `requestQty`, `unitPrice`, `reqAmount`, `usdUnitPrice`, `reviewerFlag`, `confirmFlag`)
  - `ds_PoRvNo`: Mã số xét duyệt mua sắm (`reviewRequestNo`)
- **Nghiệp vụ**: Màn hình trung tâm (SP130) để thẩm định giá, kiểm tra ngân sách và phê duyệt đơn mua sắm.

#### 5. `EmergencyPoList.lgdn`
- **Đường dẫn**: `/emsspareparts/sp105/sp180Nav/EmergencyPoList.lgdn`
- **Method**: `POST`
- **Response Dataset**:
  - `ds_result`: Danh sách đơn khẩn (`emrgPoType`, `poRequestNo`, `wipEntityName`, `requestQty`, `receivingQty`, `issueQty`)
- **Nghiệp vụ**: Màn hình quản lý mua hàng khẩn cấp (Emergency PO - SP180) khi máy dừng đột xuất cần vật tư gấp.

#### 6. `retOtherSitePoRevReqList.lgdn`
- **Đường dẫn**: `/emsspareparts/sp40/sp405Nav/retOtherSitePoRevReqList.lgdn`
- **Method**: `POST`
- **Response Dataset**:
  - `ds_list`: Danh sách so sánh giá giữa các nhà máy (`lowestUnitPriceOrgCode`, `reqSiteUnitPrice`, `poSiteUnitPrice`, `purchaseUnitPrice`)
- **Nghiệp vụ**: Phân tích chênh lệch đơn giá mua sắm giữa các nhà máy (Site Review) để tối ưu hóa chi phí mua chung.

#### 7. `retPartsTransferReqList.lgdn`
- **Đường dẫn**: `/emsspareparts/sp40/sp401Nav/retPartsTransferReqList.lgdn`
- **Method**: `POST`
- **Response Dataset**:
  - `ds_list`: Danh sách phiếu luân chuyển vật tư nội bộ (`requestNo`, `item`, `requestQty`, `currencyCode`)
- **Nghiệp vụ**: Quản lý việc chuyển kho linh kiện giữa các đơn vị/nhà máy mà không cần mua mới từ bên ngoài.
