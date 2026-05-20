# Luồng Sản phẩm LogiHub — Từ Dữ liệu Đầu vào tới Báo cáo Tư vấn

## Tổng quan dây chuyền

LogiHub là cỗ máy chuyển hoá dữ liệu vận chuyển thô của doanh nghiệp thành một bản báo cáo dài khoảng 20 trang, chỉ ra cụ thể doanh nghiệp phải mở kho ở đâu, đóng kho nào, tiết kiệm bao nhiêu tiền, và làm gì khi mùa cao điểm đến. Toàn bộ quá trình mất khoảng 5–15 phút từ lúc tải tệp lên đến lúc nhận tệp báo cáo.

Có thể hình dung hệ thống như một dây chuyền sản xuất bốn trạm: Trạm thứ nhất tiếp nhận dữ liệu thô, Trạm thứ hai ghép thêm dữ liệu thị trường mà hệ thống đã thu thập sẵn, Trạm thứ ba vận hành ba màng lọc xử lý, Trạm thứ tư đóng gói báo cáo cuối cùng. Mỗi trạm có ngưỡng kiểm tra rõ ràng để tránh đẩy lỗi xuống trạm sau. Cuối toàn bộ dây chuyền có một bước kiểm tra logic chéo — đảm bảo các kết luận trong báo cáo không mâu thuẫn lẫn nhau.

Triết lý thiết kế của hệ thống là không bắt doanh nghiệp cung cấp dữ liệu khó. Họ chỉ phải đưa ba loại dữ liệu mà ai cũng có sẵn trong sổ sách. Mọi dữ liệu thị trường, danh bạ kho, lịch mùa vụ, bản đồ giao thông — hệ thống tự nắm. Đây là điểm khác biệt cốt lõi với các phần mềm tư vấn truyền thống vốn yêu cầu doanh nghiệp phải khai báo hàng trăm trường thông tin.

---

## PHẦN 1: Doanh nghiệp Cung cấp Dữ liệu

### 1.1. Hồ sơ doanh nghiệp

Doanh nghiệp đăng ký tài khoản rồi điền một biểu mẫu nhanh gồm năm thông tin bắt buộc.

Thông tin đầu tiên là quy mô doanh nghiệp — chọn một trong ba mức: nhỏ (doanh thu dưới 100 tỷ đồng mỗi năm), trung bình (từ 100 đến 1.000 tỷ), hoặc lớn (trên 1.000 tỷ). Quy mô quyết định bộ tham số mặc định mà hệ thống sẽ áp dụng. Doanh nghiệp nhỏ có ngưỡng chịu đựng giao trễ thoáng hơn — mười lăm phần trăm đơn trễ vẫn được coi là chấp nhận được. Doanh nghiệp lớn thì khắt khe hơn nhiều — chỉ ba phần trăm đơn trễ đã là báo động đỏ. Tỷ lệ khách hàng huỷ đơn khi gặp giao trễ cũng khác nhau theo quy mô: với doanh nghiệp nhỏ là tám phần trăm, trung bình là mười lăm phần trăm, lớn là hai mươi lăm phần trăm. Doanh nghiệp lớn bị huỷ nhiều hơn vì khách hàng kỳ vọng cao hơn và có nhiều lựa chọn thay thế hơn.

Thông tin thứ hai là ngành hàng chủ lực — một trong sáu nhóm sản phẩm mà hệ thống đã định nghĩa sẵn: Kho lạnh, Điện tử, Thực phẩm và Đồ uống, Thời trang và Mỹ phẩm, Y tế, Hàng tổng hợp. Hệ thống dùng thông tin này để đoán trước phân bổ nhóm hàng khi dữ liệu giao dịch của doanh nghiệp chưa đủ phong phú để tự suy ra. Ví dụ doanh nghiệp khai báo ngành chủ lực là Thời trang và Mỹ phẩm, nhưng tệp dữ liệu họ tải lên không có cột mã sản phẩm con — hệ thống sẽ giả định mọi chuyến hàng thuộc nhóm này thay vì đoán bừa.

Thông tin thứ ba là cam kết giao hàng — doanh nghiệp khai báo họ cam kết giao trong bao nhiêu giờ với khách. Đây là chỉ số bắt buộc vì toàn bộ phép tính "vùng mù giao hàng" phụ thuộc vào ngưỡng này. Mặc định là hai mươi bốn giờ với hàng tổng hợp, sáu giờ với hàng tươi sống, bốn giờ với thuốc khẩn cấp. Doanh nghiệp có thể đặt riêng cho từng nhóm hàng nếu muốn.

Thông tin thứ tư là ngân sách trần — số tiền tối đa doanh nghiệp sẵn sàng chi cho mạng lưới kho bãi mới mỗi năm. Hệ thống dùng làm ràng buộc cho bài toán tối ưu, tránh trả về một đề xuất quá đắt mà ban lãnh đạo không thể duyệt. Nếu doanh nghiệp không muốn khai con số cụ thể, có thể chọn "không giới hạn" và hệ thống sẽ đưa ra phương án rẻ nhất theo lý thuyết.

Thông tin thứ năm là khu vực ưu tiên phục vụ — danh sách các vùng địa lý mà doanh nghiệp muốn ưu tiên tăng độ phủ. Có thể bỏ trống nếu doanh nghiệp muốn hệ thống tự đề xuất dựa trên phân tích dữ liệu.

### 1.2. Dữ liệu nhu cầu vận chuyển

Doanh nghiệp tải lên một tệp bảng tính chứa lịch sử vận chuyển trong vòng tối thiểu sáu tháng gần nhất, lý tưởng là mười hai tháng.

Mỗi dòng trong tệp đại diện cho một chuyến hàng, gồm bảy cột bắt buộc. Cột thứ nhất là ngày vận chuyển. Cột thứ hai là khu vực gửi, ghi bằng mã tỉnh hoặc tên tỉnh. Cột thứ ba là khu vực nhận. Cột thứ tư là mã sản phẩm con — thuộc một trong sáu mươi mã chuẩn mà hệ thống đã định nghĩa, ánh xạ lên sáu nhóm sản phẩm lớn. Cột thứ năm là trọng lượng, đơn vị tấn. Cột thứ sáu là số chuyến xe (nếu doanh nghiệp ghi nhận được). Cột thứ bảy là thời gian giao thực tế (nếu có dữ liệu).

Hệ thống chấp nhận dữ liệu thô không sạch. Trong thực tế, doanh nghiệp tải lên tệp có nhiều lỗi nhỏ — tên tỉnh viết sai chính tả, mã sản phẩm không chuẩn, ngày tháng định dạng lung tung, đơn vị trọng lượng có cái ghi bằng tấn có cái ghi bằng ki-lô-gam. Một bộ lọc thông minh sẽ tự động chuẩn hoá: ghép tên tỉnh về dạng chuẩn dựa trên từ điển đồng nghĩa (ví dụ "Gyeonggi", "kyung-gi", "경기" đều được hiểu là Tỉnh Gyeonggi); gán mã sản phẩm gần nhất theo độ tương tự văn bản; chuyển ngày về định dạng năm-tháng-ngày; quy đổi mọi đơn vị trọng lượng về tấn.

Sau khi tải lên, doanh nghiệp được xem một bảng "Hệ thống đã hiểu dữ liệu của bạn như sau" — liệt kê một trăm dòng đầu tiên đã chuẩn hoá, kèm cờ đỏ ở các trường mà hệ thống không chắc chắn. Doanh nghiệp có thể sửa tay nếu hệ thống đoán sai, rồi xác nhận. Đây là bước đảm bảo chất lượng đầu vào, vì rác vào thì rác ra. Hệ thống chỉ cho phép sang bước tiếp theo sau khi doanh nghiệp đã xác nhận tối thiểu chín mươi phần trăm dòng được hiểu đúng.

### 1.3. Dữ liệu mạng lưới kho bãi hiện tại

Đây là phần tuỳ chọn nhưng quan trọng nếu doanh nghiệp đang đã có hệ thống kho. Họ khai báo từng kho gồm sáu thông tin: tên hoặc mã kho, địa chỉ đầy đủ, sức chứa tối đa tính theo mét khối hoặc tấn, loại kho (tự vận hành, đi thuê dài hạn, hay thuê theo mùa), chi phí cố định mỗi năm bao gồm tiền thuê đất, nhân công, điện nước cố định, và loại hàng đang lưu chính.

Nếu doanh nghiệp chưa có kho — họ là doanh nghiệp khởi nghiệp đang xây mạng lưới từ con số không, hoặc là doanh nghiệp đang mở rộng sang thị trường mới — họ có thể bỏ trống mục này. Hệ thống sẽ chuyển sang chế độ "thiết kế từ đầu" thay vì chế độ "tối ưu cải tiến mạng lưới có sẵn". Hai chế độ này dùng cùng bộ toán nhưng cho ra báo cáo có giọng văn khác nhau — chế độ thiết kế mới sẽ thiên về đề xuất thuê kho, còn chế độ tối ưu sẽ thiên về phân tích kho nào nên giữ, kho nào nên thanh lý.

### 1.4. Cổng tải tệp và xác thực

Khi doanh nghiệp bấm nút tải lên, hệ thống thực hiện bảy bước kiểm tra trước khi cho phép sang bước tiếp theo.

Bước thứ nhất là kiểm tra định dạng tệp — chỉ chấp nhận bảng tính chuẩn. Bước thứ hai là kiểm tra số dòng tối thiểu — không nhận tệp dưới một trăm chuyến hàng vì thống kê không đủ ý nghĩa. Bước thứ ba là kiểm tra phân bố thời gian — không nhận tệp chỉ có dữ liệu một tháng vì không phát hiện được mùa vụ. Bước thứ tư là kiểm tra phân bố địa lý — yêu cầu ít nhất năm cặp tỉnh khác nhau để bài toán phân bổ có ý nghĩa. Bước thứ năm là kiểm tra phân bố nhóm sản phẩm — yêu cầu ít nhất ba nhóm khác nhau. Bước thứ sáu là cảnh báo dữ liệu bất thường — ví dụ một chuyến hàng một trăm ngàn tấn là vô lý, một chuyến hàng đi quãng đường âm là lỗi nhập liệu. Bước thứ bảy là tạo bản sao gốc cất giữ để có thể truy lại nếu sau này doanh nghiệp khiếu nại kết quả.

Khi tất cả bảy bước qua, hệ thống chuyển sang Phần 2.

---

## PHẦN 2: Hệ thống Tự Thu thập Dữ liệu Bổ sung

Doanh nghiệp không phải cung cấp dữ liệu thị trường — hệ thống đã có sẵn ba kho dữ liệu khổng lồ, cập nhật thường xuyên, và tự ghép vào dữ liệu của doanh nghiệp.

### 2.1. Danh bạ kho bãi toàn quốc

Hệ thống duy trì một danh bạ hơn bốn ngàn bốn trăm kho bãi trên toàn Hàn Quốc, lấy từ ba nguồn. Nguồn thứ nhất là dữ liệu công khai của cơ quan quản lý vận tải. Nguồn thứ hai là bản đồ thương mại của các nền tảng cho thuê kho lớn. Nguồn thứ ba là dữ liệu tự thu thập qua việc quét địa chỉ trên các trang web bất động sản công nghiệp.

Với mỗi kho, hệ thống ghi nhận mười hai trường thông tin: mã kho, tên đơn vị vận hành, tỉnh, địa chỉ chi tiết, toạ độ địa lý gồm kinh tuyến và vĩ tuyến, diện tích, sức chứa tấn, chi phí cố định ước tính, loại hàng đang lưu chính đã được phân vào sáu nhóm chuẩn, chứng chỉ đặc biệt (cấp đông sâu, kho chứa hoá chất, kho an ninh cao, kho thực hành phân phối tốt cho thuốc), trạng thái sẵn sàng cho thuê (còn chỗ, kín lịch, đang nâng cấp), và mức độ tin cậy của thông tin địa chỉ.

Danh bạ này được cập nhật hàng quý. Nó là tài sản chiến lược của hệ thống — chính nó cho phép báo cáo nói cụ thể "thuê kho này, gọi cho số điện thoại này, ký hợp đồng với đơn vị này" thay vì chỉ nói chung chung "thuê thêm kho ở vùng Gyeonggi".

### 2.2. Lịch sự kiện và biến động mùa vụ

Hệ thống có một thư viện sự kiện gồm hơn ba mươi mục, phân thành bốn loại.

Loại thứ nhất là sự kiện văn hoá định kỳ — Tết Nguyên đán cuối tháng một hoặc đầu tháng hai, Trung thu cuối tháng chín hoặc đầu tháng mười, Ngày Phụ huynh tháng năm, Ngày Trẻ em tháng năm, Ngày Thầy cô tháng năm. Mỗi sự kiện có lịch chính xác đến từng ngày, kèm bảng nhân số nhu cầu cho từng nhóm hàng. Ví dụ với Trung thu thì thực phẩm và đồ uống nhân hai phẩy bảy lần, kho lạnh nhân ba phẩy một lần, hàng tổng hợp nhân một phẩy năm lần, các nhóm khác không thay đổi nhiều.

Loại thứ hai là sự kiện thương mại định kỳ — đợt khuyến mãi mười một tháng mười một, ngày Black Friday du nhập từ phương Tây, đợt giảm giá cuối năm, đợt ra mắt sản phẩm mới của các thương hiệu lớn. Mỗi sự kiện kèm vùng địa lý ảnh hưởng mạnh nhất. Đợt khuyến mãi mười một tháng mười một thường ảnh hưởng mạnh nhất ở các thành phố lớn vì dân thành thị mua sắm online nhiều hơn dân nông thôn.

Loại thứ ba là sự kiện rủi ro bất ngờ — đợt dịch bệnh, đợt thu hồi sản phẩm, đợt cấm vận chuyển do thiên tai, đợt đình công của tài xế. Hệ thống ghi nhận lịch sử các đợt này và mô hình hoá tác động lên nhu cầu. Khi mô phỏng kịch bản xấu, hệ thống đưa các sự kiện này vào.

Loại thứ tư là sự kiện ngành hàng riêng biệt — chu kỳ thu hoạch nông sản, chu kỳ tựu trường gây tăng nhu cầu văn phòng phẩm, chu kỳ ra mắt điện thoại mới của các hãng lớn. Mỗi sự kiện chỉ ảnh hưởng một hoặc hai nhóm trong sáu nhóm sản phẩm.

### 2.3. Mạng lưới giao thông thực tế

Hệ thống lưu sẵn ma trận khoảng cách đường bộ giữa mọi cặp tỉnh trong số mười bảy tỉnh và thành phố. Khoảng cách không phải đường chim bay vì sai số quá lớn, mà là độ dài quãng đường thực tế xe tải có thể đi, kèm thời gian trung bình vào giờ thường và giờ cao điểm.

Ngoài khoảng cách tỉnh đến tỉnh, hệ thống còn lưu khoảng cách từ mỗi kho cụ thể đến các điểm nóng giao thông — cảng Busan, cảng Incheon, cảng Pyeongtaek, cảng Gwangyang, sân bay quốc tế Incheon. Tham số này quan trọng để gán vai trò Trạm Trung chuyển Cảng cho các kho nằm gần cảng.

Cuối cùng, hệ thống nắm danh sách năm mươi hành lang vận chuyển bận nhất cả nước — tức năm mươi cặp tỉnh có lưu lượng hàng hoá lớn nhất trong dữ liệu công khai. Khi tính toán, hệ thống ưu tiên đảm bảo các hành lang này không bị nghẽn.

---

## PHẦN 3: Ba Màng lọc Xử lý

Dữ liệu của doanh nghiệp, sau khi đã được làm giàu bằng dữ liệu thị trường ở Phần 2, đi qua ba màng lọc nối tiếp. Mỗi màng lọc giải quyết một loại logic khác nhau.

### 3.1. Màng lọc thứ nhất — Sàng lọc vật lý và Yêu cầu pháp lý

Mục đích là cắt bỏ những phương án phân bổ kho rõ ràng không khả thi về mặt vật lý hoặc pháp lý, để không lãng phí thời gian tính toán ở các màng lọc sau.

Hệ thống đi qua từng chuyến hàng trong dữ liệu của doanh nghiệp. Với mỗi chuyến, hệ thống đọc mã sản phẩm rồi tra ba bảng quyết định.

Bảng thứ nhất là yêu cầu nhiệt độ. Nếu chuyến hàng thuộc nhóm Kho lạnh thì nó chỉ được chứa ở kho có chứng chỉ làm lạnh sâu (dưới âm mười tám độ) hoặc làm mát (dưới bốn độ). Bảng đối chiếu chứng chỉ này lấy từ danh bạ kho bãi ở Phần 2.1. Một chuyến thịt đông lạnh đi qua kho thông thường không có chứng chỉ lạnh sẽ bị gạch bỏ khỏi mọi phương án phân bổ.

Bảng thứ hai là yêu cầu an toàn. Hàng Công nghiệp dạng pin, hoá chất, vật liệu nổ — chỉ được chứa ở kho có giấy phép lưu trữ hàng nguy hiểm. Y tế dạng vắc-xin hoặc thuốc kiểm soát đặc biệt — chỉ được chứa ở kho có chứng chỉ Tốt-trong-Thực-hành-Phân-phối.

Bảng thứ ba là yêu cầu an ninh. Hàng Điện tử giá trị cao và Thời trang – Mỹ phẩm thương hiệu cao cấp được khuyến nghị (không bắt buộc) chỉ chứa ở kho có hệ thống an ninh nhiều lớp gồm cổng từ, ca-mê-ra trí tuệ nhân tạo, bảo vệ trực hai mươi bốn giờ. Khuyến nghị không bắt buộc nghĩa là phương án vi phạm vẫn được giữ trong danh sách nhưng bị trừ điểm.

Đồng thời, màng lọc thứ nhất quy đổi trọng lượng thành thể tích. Đây là bước cực kỳ quan trọng mà phần lớn doanh nghiệp bỏ qua khi tự tính. Lý do là kho bãi cho thuê theo mét khối chứ không theo tấn, mà mỗi nhóm hàng có tỷ trọng riêng. Một tấn hàng Thời trang chiếm khoảng sáu mét khối vì quần áo bồng bềnh. Một tấn hàng Công nghiệp dạng kim loại chỉ chiếm khoảng không phẩy ba mét khối. Nếu tính nhầm theo tấn, doanh nghiệp sẽ đặt mua sức chứa kho thiếu hai mươi lần thực tế hoặc thừa hai mươi lần — cả hai đều đốt tiền vô lý. Hệ thống dùng bảng tỷ trọng chuẩn gồm sáu mươi dòng cho sáu mươi mã sản phẩm con để chuyển đổi chính xác.

Kết quả của Màng lọc thứ nhất là một danh sách chuyến hàng được gán cờ "có thể đi qua kho nào" và một con số thể tích chiếm chỗ thực tế. Mọi chuyến hàng được giữ lại, không xoá dòng nào — chỉ cờ ghép kho bị hạn chế.

### 3.2. Màng lọc thứ hai — Nhân bản nhu cầu theo Mùa vụ

Mục đích là dự báo lượng hàng sẽ chảy qua mạng lưới trong tương lai, không chỉ dựa vào dữ liệu trung bình mà phải tính cả các đỉnh điểm. Nếu chỉ tính trung bình rồi xây mạng lưới theo đó, mùa cao điểm chắc chắn vỡ trận.

Hệ thống lấy dữ liệu lịch sử mười hai tháng đã lọc ở bước trước, rồi nhân chiều thời gian. Với mỗi nhóm trong sáu nhóm sản phẩm và mỗi tháng trong mười hai tháng tới, hệ thống lập một bảng nhân tử.

Cách tính nhân tử như sau. Đầu tiên, hệ thống lấy chỉ số mùa vụ cơ sở của nhóm hàng tại tháng đó — đây là số đã được hiệu chỉnh từ dữ liệu công khai và kinh nghiệm ngành. Ví dụ nhóm Thực phẩm và Đồ uống vào tháng chín có chỉ số một phẩy mười lăm, tức cao hơn trung bình mười lăm phần trăm do gần Trung thu. Sau đó, hệ thống cộng thêm tác động của các sự kiện cụ thể rơi vào tháng đó. Trung thu năm 2026 rơi vào tháng mười — hệ thống cộng thêm nhân tử hai phẩy bảy cho nhóm Thực phẩm trong khoảng cửa sổ hai mươi mốt ngày quanh ngày Trung thu. Cuối cùng, hệ thống cộng thêm tác động ngẫu nhiên ước tính — biên độ dao động trung bình cộng trừ mười lăm phần trăm so với dự báo điểm, để mô phỏng những biến động không lường trước được.

Kết quả là một bảng dự báo nhu cầu chi tiết. Với mỗi cặp tỉnh gửi và tỉnh nhận, mỗi nhóm hàng, mỗi tháng, hệ thống có ba con số: nhu cầu trung bình, nhu cầu đỉnh, và nhu cầu đáy. Đây là đầu vào quan trọng nhất cho bài toán tối ưu ở màng lọc cuối.

Một điểm tinh tế của màng lọc này: hệ thống không chỉ nhân nhu cầu lên theo thời gian mà còn dịch nhu cầu trong không gian. Ví dụ vào dịp Tết, nhu cầu ở Seoul và Busan không chỉ tăng mà còn dồn từ các tỉnh nông thôn (nơi người dân về quê) ra các thành phố lớn (nơi siêu thị bán quà Tết). Bảng dịch chuyển không gian này lấy từ dữ liệu di chuyển dân cư công khai. Bỏ qua dịch chuyển không gian là một lỗi tinh vi mà các phần mềm đối thủ thường mắc phải.

### 3.3. Màng lọc thứ ba — Tối ưu hoá toán học

Đây là trái tim của hệ thống. Đầu vào là dự báo nhu cầu đỉnh đã tính ở Màng lọc thứ hai và danh sách kho được phép từ Màng lọc thứ nhất. Đầu ra là một phương án phân bổ tối ưu.

Hệ thống chạy ba bài toán tối ưu song song, mỗi bài toán trả lời một câu hỏi khác nhau.

Bài toán thứ nhất là "đặt trung tâm khổng lồ ở đâu". Hệ thống thử mở ba kho lớn, năm kho lớn, hoặc bảy kho lớn trên toàn quốc, mỗi lựa chọn cho ra một bộ kho khác nhau với tổng chi phí khác nhau. Mục tiêu là tối thiểu hoá tổng quãng đường vận chuyển nhân với khối lượng — nói cách khác, đặt kho làm sao để hàng đi gần nhất tới mọi khách hàng. Bài toán này không xét chi phí cố định của kho, chỉ xét chi phí đường đi.

Bài toán thứ hai là "thuê kho nào nếu có ngân sách giới hạn". Mỗi kho trong danh bạ có chi phí cố định riêng, và mỗi cặp tỉnh có chi phí biến đổi gồm xăng dầu, tài xế, phí cầu đường. Hệ thống tìm tổ hợp kho — trong ràng buộc ngân sách doanh nghiệp đã khai báo ở Phần 1.1 — để tổng chi phí cố định cộng chi phí biến đổi là nhỏ nhất. Bài toán này thực tế hơn bài toán thứ nhất vì có xét ngân sách thực của doanh nghiệp.

Bài toán thứ ba là "phương án nào chịu được sốc". Hệ thống thử mô phỏng một trăm kịch bản gồm đỉnh điểm cao bất thường, một số kho bị đóng tạm vì cháy nổ hay thanh tra, một hành lang giao thông bị nghẽn vì lụt hay tai nạn, một sự kiện đột xuất như đại dịch. Hệ thống đo xem mỗi phương án từ hai bài toán trên còn vận hành được không trong từng kịch bản. Phương án nào sống sót nhiều kịch bản nhất được điểm cao hơn ở chiều độ bền.

Sau khi ba bài toán chạy xong, hệ thống tổng hợp kết quả thành một xếp hạng các phương án, mỗi phương án kèm bốn chỉ số: tổng chi phí, độ trễ trung bình, độ phủ địa lý, độ bền với sốc. Doanh nghiệp sẽ thấy ít nhất ba phương án trong báo cáo cuối cùng — phương án rẻ nhất, phương án nhanh nhất, và phương án cân bằng giữa hai chiều.

---

## PHẦN 4: Logic Sinh Báo cáo Tự động

Báo cáo cuối cùng dày khoảng hai mươi trang, viết hoàn toàn bằng văn xuôi tiếng Việt, không phải bảng số khô khan. Để sinh ra văn bản này, hệ thống vận hành một bộ quy tắc viết — mỗi mục trong báo cáo có một logic riêng. Dưới đây là chi tiết cách hệ thống suy luận để viết từng mục.

### 4.1. Mục một — Chẩn đoán Mạng lưới Hiện tại

Mục này nói với doanh nghiệp: mạng lưới của bạn đang gặp ba bốn vấn đề lớn cụ thể. Hệ thống không nói chung chung mà chỉ thẳng vấn đề ở đâu, mức độ ra sao, lý do tại sao xảy ra.

**Logic phát hiện kho quá tải.** Hệ thống lấy nhu cầu đỉnh đã dự báo cho từng kho từ Màng lọc thứ hai, chia cho sức chứa kho lấy từ Phần 1.3. Nếu tỷ lệ vượt một trăm phần trăm, hệ thống ghi một dòng cảnh báo đỏ. Nếu tỷ lệ trong khoảng tám mươi lăm đến một trăm phần trăm, ghi cảnh báo vàng. Mức nghiêm trọng của câu chữ tự động thay đổi: trên một trăm ba mươi phần trăm sẽ dùng từ "vỡ trận", từ một trăm đến một trăm ba mươi phần trăm dùng "tràn", từ tám mươi lăm đến một trăm phần trăm dùng "căng cứng".

Mẫu câu sinh tự động: "Kho [tên kho] tại [tên tỉnh] sẽ [mức độ nghiêm trọng] vào tháng [tháng] do lượng hàng [nhóm sản phẩm chính] tăng [phần trăm] so với trung bình năm. Cụ thể, nhu cầu đỉnh ước tính [con số] mét khối trong khi sức chứa thực tế của kho chỉ [con số] mét khối, vượt [phần trăm chênh] sức chứa cho phép. Nguyên nhân chính là [tên sự kiện gây đỉnh]."

**Logic phát hiện vùng mù giao hàng.** Hệ thống lấy cam kết giao hàng từ Phần 1.1 — ví dụ doanh nghiệp cam kết giao trong hai mươi bốn giờ. Với mỗi tỉnh nhận, hệ thống tìm kho gần nhất trong mạng lưới hiện tại của doanh nghiệp, tính thời gian xe chạy từ kho đó dựa trên ma trận khoảng cách ở Phần 2.3. Nếu thời gian chạy vượt cam kết, tỉnh đó bị gán cờ "vùng mù". Hệ thống tính thêm bao nhiêu phần trăm đơn hàng đi qua tỉnh này, từ đó suy ra tỷ lệ trễ tổng thể.

Mẫu câu: "Vùng [tên tỉnh] đang vi phạm cam kết giao hàng [số giờ cam kết] giờ. Kho gần nhất là [tên kho] cách [số ki-lô-mét], thời gian chạy thực tế [số giờ thực tế], chênh [số giờ chênh] giờ so với cam kết. Tỷ lệ đơn hàng trễ dự kiến trong vùng này lên tới [phần trăm], chiếm [phần trăm khác] tổng số đơn của công ty trong cả năm."

**Logic phát hiện kho hoạt động kém hiệu quả.** Hệ thống tính chi phí trên mỗi mét khối lưu kho thực tế cho từng kho, so với trung vị toàn ngành. Nếu một kho có chi phí cao hơn trung vị năm mươi phần trăm nhưng lưu kho ít hơn trung vị ba mươi phần trăm, kho đó bị gán cờ "đốt tiền". Mục này đặc biệt hữu ích khi doanh nghiệp đang đi thuê nhiều kho nhỏ rời rạc do mở rộng nhanh không quy hoạch.

Mẫu câu: "Kho [tên kho] đang trả [số tiền] mỗi năm nhưng chỉ sử dụng trung bình [phần trăm] sức chứa. Chi phí trên mỗi mét khối lưu trữ là [số tiền], cao hơn mức thị trường [phần trăm]. Đề xuất xem xét chấm dứt hợp đồng và chuyển lượng hàng này sang kho [tên kho đề xuất]."

**Logic phát hiện hành lang nghẽn.** Hệ thống lấy năm mươi hành lang bận nhất từ Phần 2.3, kiểm tra hành lang nào có lưu lượng dự báo vượt sức chứa lý thuyết của tuyến. Mẫu câu giải thích rõ hành lang nào, vì nhóm hàng nào, dự kiến nghẽn ngày nào, và đề xuất hành lang phụ thay thế.

### 4.2. Mục hai — Định hình lại Vai trò Kho bãi

Mục này gán cho mỗi kho một danh hiệu chiến lược trong số sáu vai trò chuẩn: Trung tâm Trọng điểm (kho khổng lồ phục vụ toàn quốc), Trung tâm Vùng (kho lớn phục vụ một vùng địa lý), Trạm Bảo mật (kho an ninh cao cho hàng giá trị cao), Trạm Phục vụ Cuối (kho nhỏ gần khách hàng cuối), Trạm Trung chuyển Cảng (kho gần cảng, không lưu lâu), Kho Dự phòng (kho chỉ kích hoạt khi cao điểm).

**Logic phong chức Trạm Phân phối Lạnh — một dạng đặc biệt của Trung tâm Trọng điểm.** Hệ thống đếm tỷ lệ hàng đi qua kho thuộc nhóm Kho lạnh và Thực phẩm – Đồ uống. Nếu tỷ lệ vượt năm mươi phần trăm và sức chứa kho thuộc top ba mươi phần trăm toàn quốc, hệ thống đề xuất nâng cấp.

Mẫu câu: "Kho [tên kho] hiện đang xử lý [phần trăm] hàng cần lạnh. Đề xuất nâng cấp toàn diện thành Trạm Phân phối Lạnh — đầu tư hệ thống lạnh thêm [số tiền], dừng nhận hàng tạp hoá thông thường, tập trung phục vụ vùng [danh sách tỉnh phục vụ]. Hiệu quả ước tính: giảm hao phí năng lượng [phần trăm] do không phải duy trì hai chế độ nhiệt cùng lúc, tăng tốc độ luân chuyển hàng [phần trăm] do không phải phân loại lẫn lộn."

**Logic phong chức Trạm Trung chuyển Cảng.** Hệ thống tính khoảng cách kho đến cảng gần nhất. Nếu dưới năm mươi ki-lô-mét và sức chứa kho thuộc top năm mươi phần trăm, hệ thống đề xuất biến kho này thành điểm gom hàng từ cảng — chuyên trị mô hình nhập khẩu rồi phân phối nội địa, không lưu kho dài ngày.

Mẫu câu: "Kho [tên kho] nằm cách cảng [tên cảng] chỉ [số ki-lô-mét]. Đề xuất chuyên hoá thành Trạm Trung chuyển Cảng — tiếp nhận hàng nhập từ tàu vào, phân loại theo nhóm sản phẩm, chuyển ngay trong ngày tới các Trung tâm Vùng. Mục tiêu: giảm thời gian lưu kho trung bình từ [số ngày cũ] xuống còn [số ngày mới], giải phóng sức chứa cho các kho khác."

**Logic phong chức Trạm Gỡ Rối.** Đây là kho được sinh ra chỉ để giải quyết vùng mù giao hàng đã phát hiện ở Mục một. Hệ thống quét danh bạ kho bãi để tìm kho gần vùng mù nhất, có sức chứa nhỏ từ hai trăm đến một ngàn mét khối, chi phí thuê thấp, và đề xuất doanh nghiệp thuê ngắn hạn. Trạm này không lưu trữ dài, chỉ nhận hàng từ Trung tâm Vùng buổi sáng và giao đi trong buổi chiều.

Mẫu câu: "Để giải vùng mù [tên tỉnh], đề xuất thuê kho [tên kho cụ thể trong danh bạ] địa chỉ [địa chỉ], sức chứa [số] mét khối, chi phí ước tính [số tiền] mỗi năm. Vai trò: Trạm Gỡ Rối, nhận hàng từ Trung tâm Vùng [tên Trung tâm Vùng nguồn], giao trong ngày tới [danh sách quận khách hàng]. Sau khi mở, thời gian giao trung bình ước giảm từ [số giờ cũ] xuống [số giờ mới] giờ."

**Logic tước chức xuống Kho Dự phòng.** Một kho hiện tại có vai trò trung tâm nhưng hoạt động kém — đã bị cờ "đốt tiền" ở Mục một — sẽ bị hệ thống đề xuất hạ vai trò xuống Kho Dự phòng. Trong vai trò mới, kho chỉ kích hoạt vào mùa cao điểm, còn lại đóng cửa hoặc cho thuê lại cho bên thứ ba. Đây là cách giảm chi phí cố định mà không bị mất khả năng dự phòng.

### 4.3. Mục ba — Cẩm nang Ứng phó Sự kiện

Mục này dành cho cấp quản lý vận hành, viết theo kiểu lệnh hành động. Mỗi sự kiện trong thư viện ở Phần 2.2 sinh ra một cẩm nang con dài khoảng nửa trang. Nếu doanh nghiệp thuộc ngành cụ thể chỉ bị ảnh hưởng bởi một vài sự kiện, hệ thống chỉ in cẩm nang cho các sự kiện liên quan, không in dư.

**Logic sinh câu lệnh ứng phó.** Hệ thống ghép bốn biến số. Biến thứ nhất là tên sự kiện và ngày bắt đầu cụ thể. Biến thứ hai là nhóm sản phẩm bị ảnh hưởng mạnh nhất — tính bằng cách lấy nhân tử nhu cầu trừ một, lấy nhóm có giá trị cao nhất. Biến thứ ba là tình trạng kho dự kiến tại thời điểm đỉnh — lấy từ kết quả Màng lọc thứ ba, đếm xem có bao nhiêu kho vượt chín mươi lăm phần trăm sức chứa. Biến thứ tư là hành động cần làm — chọn từ danh sách mười hai hành động chuẩn.

Mười hai hành động chuẩn gồm: chuẩn bị trước hàng (đẩy hàng từ Trung tâm Trọng điểm xuống Trung tâm Vùng trước cao điểm), mở Kho Dự phòng, đổi hành lang vận chuyển sang hành lang phụ, tăng tần suất xe ra Trạm Phục vụ Cuối, thuê thêm tài xế thời vụ, giảm thời gian lưu kho tối đa cho phép, đóng nhận đơn ngoài giờ, áp giá thưởng ưu tiên cho khách trả thêm, kéo hàng từ kho khác vùng, đàm phán hợp đồng vận tải bổ sung, kích hoạt bảo hiểm trễ hạn, mở kênh liên lạc khách hàng dự phòng để báo trước trễ.

Mẫu câu cụ thể: "Để đối phó với [Tên sự kiện] dự kiến diễn ra từ [ngày bắt đầu] đến [ngày kết thúc], do lượng [Nhóm sản phẩm ảnh hưởng] tăng dự báo [phần trăm tăng], dự kiến [Tình trạng kho — ví dụ: ba Trung tâm Vùng bị tràn hai mươi phần trăm sức chứa], yêu cầu Giám đốc Vận hành thực hiện theo trình tự ba bước. Bước một: [Hành động một] trước sự kiện [số ngày một] ngày. Bước hai: [Hành động hai] khi tải kho vượt [ngưỡng phần trăm]. Bước ba: [Hành động ba] nếu tình huống xấu nhất xảy ra. Chỉ tiêu thành công: tỷ lệ giao đúng hẹn lớn hơn hoặc bằng [phần trăm mục tiêu], tỷ lệ huỷ đơn nhỏ hơn hoặc bằng [phần trăm mục tiêu]."

**Logic sinh quy tắc rút lui.** Đây là phần dễ quên nhưng quan trọng. Hệ thống tự sinh ra quy tắc cho mỗi sự kiện: khi nào thì gỡ chế độ khẩn cấp, khi nào trả Kho Dự phòng lại, khi nào kết thúc ca tăng cường. Nếu không có quy tắc rút lui, doanh nghiệp dễ duy trì trạng thái căng thẳng quá lâu, đốt tiền không cần thiết.

Mẫu câu: "Sau khi [Tên sự kiện] kết thúc, theo dõi nhu cầu trong [số ngày] ngày tiếp theo. Khi nhu cầu trở về dưới [ngưỡng phần trăm] so với trung bình trong [số ngày khác] ngày liên tiếp, thực hiện rút lui: ngừng hợp đồng tài xế thời vụ, đóng Kho Dự phòng, trả lại hành lang vận chuyển chính, gỡ chế độ áp giá thưởng."

### 4.4. Mục bốn — Bài toán Kinh doanh và Hiệu quả Đầu tư

Mục này là mục quan trọng nhất, dành cho Tổng Giám đốc đọc trong ba phút để duyệt chi tiền. Toàn bộ phép tính đều quy về đơn vị tiền — không có bảng nhu cầu hay biểu đồ địa lý vô tri.

**Logic tính tiền mất nếu không làm gì.** Hệ thống lấy ba biến số. Biến thứ nhất là số đơn hàng dự kiến giao trễ — tính từ tỷ lệ vùng mù đã phát hiện ở Mục một, nhân với tổng số đơn dự báo cho mười hai tháng tới. Biến thứ hai là tỷ lệ khách huỷ đơn khi giao trễ — lấy từ Phần 1.1 dựa trên quy mô doanh nghiệp (tám phần trăm với nhỏ, mười lăm phần trăm với trung bình, hai mươi lăm phần trăm với lớn). Biến thứ ba là giá trị trung bình mỗi đơn — tính từ dữ liệu của doanh nghiệp, lấy tổng doanh thu chia tổng số đơn.

Phép nhân ba biến này cho ra "thiệt hại doanh thu nếu giữ nguyên mạng lưới". Hệ thống cộng thêm "thiệt hại danh tiếng" — ước tính từ một bảng chuẩn ngành, dao động từ không phẩy hai đến không phẩy năm lần thiệt hại doanh thu, tuỳ ngành hàng (hàng cao cấp thì hệ số cao hơn vì uy tín thương hiệu quan trọng hơn).

Mẫu câu kết luận: "Nếu giữ nguyên mạng lưới hiện tại, công ty dự kiến mất [số tiền] doanh thu do khách huỷ đơn trong [khoảng thời gian]. Trong đó [phần trăm] đến từ mùa Tết, [phần trăm] từ đợt khuyến mãi cuối năm, [phần trăm] từ vùng mù giao hàng cố hữu. Tổn thất danh tiếng ước thêm [số tiền], được tính dựa trên hệ số ngành [hệ số] phù hợp với loại hàng [nhóm sản phẩm chính của doanh nghiệp]. Tổng thiệt hại dự kiến nếu không hành động: [tổng]."

**Logic chứng minh Hiệu quả Đầu tư.** Hệ thống lấy tổng chi phí cố định của phương án đề xuất từ Màng lọc thứ ba — bao gồm tiền thuê kho mới, đầu tư hệ thống lạnh nếu có, tiền nâng cấp công nghệ, tiền tuyển nhân sự bổ sung. So sánh với thiệt hại sẽ tránh được. Tính tỷ số lợi ích trên chi phí và thời gian hoàn vốn theo dòng tiền tháng.

Mẫu câu: "Phương án đề xuất tốn thêm [số tiền] chi phí cố định mỗi năm. Bù lại, cứu được [số tiền] doanh thu sắp mất, tăng thêm [số tiền] doanh thu mới do mở rộng vùng phục vụ, giảm [số tiền] chi phí vận chuyển nhờ tối ưu hành lang. Tổng giá trị tạo ra trên năm: [tổng]. Thời gian hoàn vốn dự kiến [số tháng]. Tỷ số lợi ích chia cho chi phí: [số]. Khuyến nghị: [Triển khai ngay / Thử nghiệm trước một vùng / Xem xét lại]."

Mức độ khuyến nghị tự động chọn dựa trên ba ngưỡng. Tỷ số lợi ích chia cho chi phí trên hai phẩy năm thì khuyến nghị thực hiện ngay. Từ một phẩy năm đến hai phẩy năm thì khuyến nghị thử nghiệm trước ở một vùng nhỏ rồi mở rộng. Dưới một phẩy năm thì khuyến nghị xem xét lại — có thể dữ liệu chưa đủ, có thể phương án chưa tối ưu, có thể bản chất bài toán không có giải pháp ngon.

**Logic so sánh kịch bản.** Hệ thống đưa ra ba phương án thay vì chỉ một, đặt cạnh nhau trong cùng một bảng so sánh. Phương án thứ nhất là rẻ nhất — tiết kiệm chi phí, nhưng độ phủ giao hàng có thể giảm. Phương án thứ hai là nhanh nhất — phủ rộng, giao nhanh, nhưng tốn tiền. Phương án thứ ba là cân bằng — chấp nhận đắt hơn rẻ nhất một chút để đổi lấy độ phủ tốt hơn. Mỗi phương án có một bảng so sánh: chi phí, thời gian giao trung bình, độ phủ địa lý, độ bền với sốc, thời gian hoàn vốn. Doanh nghiệp tự chọn phương án phù hợp với khẩu vị rủi ro của họ.

### 4.5. Mục năm — Lộ trình Triển khai

Mục cuối của báo cáo dịch phương án được chọn thành một lộ trình hành động chia theo tháng, dài mười hai đến mười tám tháng. Đây là phần biến từ "ý tưởng hay" sang "việc làm được".

Tháng một và hai tập trung vào khâu pháp lý và nhân sự — ký hợp đồng các kho mới, thanh lý các kho không hiệu quả, tuyển dụng các nhân sự chủ chốt (Giám đốc kho mới, Trưởng phòng Vận hành Vùng).

Tháng ba và bốn tập trung vào nâng cấp hạ tầng — lắp đặt hệ thống lạnh ở các Trạm Phân phối Lạnh mới, lắp đặt hệ thống an ninh ở các Trạm Bảo mật, triển khai phần mềm quản lý kho thống nhất.

Tháng năm và sáu chạy thử với một vùng nhỏ — thường là một tỉnh — để kiểm tra phương án trên thực tế trước khi mở rộng. Đây là giai đoạn dễ phát hiện rủi ro mà bài toán toán học không thấy được.

Tháng bảy và tám mở rộng toàn quốc — kích hoạt mạng lưới mới ở mọi vùng cùng lúc.

Từ tháng chín trở đi là tối ưu liên tục, đo lường, điều chỉnh — sau mỗi chu kỳ quý, hệ thống tự chạy lại toàn bộ dây chuyền với dữ liệu mới và cho ra một báo cáo cập nhật ngắn hai trang.

Mỗi mốc kèm danh sách công việc cụ thể, người chịu trách nhiệm gợi ý (Giám đốc Vận hành, Giám đốc Tài chính, Trưởng phòng Kho, …), ngân sách dự kiến cho từng đầu việc, và chỉ tiêu đo lường thành công cho từng giai đoạn.

---

## PHẦN 5: Đóng gói và Bàn giao Báo cáo

Sau khi bốn phần chính của báo cáo được sinh ra, hệ thống đi qua ba bước hoàn thiện trước khi gửi cho doanh nghiệp.

**Bước thứ nhất — Kiểm tra logic chéo.** Hệ thống chạy lại các con số trong báo cáo để đảm bảo không có mâu thuẫn. Ví dụ Mục một nói kho A quá tải, nhưng Mục hai lại gán kho A vai trò Kho Dự phòng — vô lý vì Kho Dự phòng đáng lẽ phải còn dư sức chứa. Khi phát hiện mâu thuẫn, hệ thống cố gắng sửa tự động (ưu tiên kết quả của Màng lọc thứ ba vì đây là khâu cuối), nếu không sửa được thì đánh dấu chờ con người duyệt thủ công.

**Bước thứ hai — Tô điểm văn phong.** Một mô hình ngôn ngữ tự nhiên làm mượt câu chữ, thêm câu chuyển ý giữa các mục, đảm bảo không có hai đoạn liên tiếp dùng cùng một mẫu câu. Bước này biến từ "robot viết" thành "người viết" — giọng văn ấm hơn, nhưng vẫn giữ chính xác con số.

**Bước thứ ba — Dựng tệp báo cáo.** Hệ thống dùng mẫu trang chuẩn của công ty doanh nghiệp — biểu tượng, màu sắc, kiểu chữ lấy từ hồ sơ doanh nghiệp ở Phần 1.1 — chèn bốn biểu đồ chính (phân bố nhu cầu theo tháng, bản đồ kho hiện tại và đề xuất, biểu đồ so sánh chi phí ba phương án, biểu đồ hoàn vốn theo thời gian), đánh số trang, sinh mục lục tự động.

Báo cáo cuối cùng được gửi qua thư điện tử mà doanh nghiệp đã đăng ký, kèm bản tóm tắt một trang dành cho cấp quản lý xem nhanh, và một liên kết web động — nơi doanh nghiệp có thể tương tác sâu hơn: nhấn vào kho để xem chi tiết, kéo thanh trượt để xem phương án thay đổi theo ngân sách khác, thử các kịch bản giả định "nếu nhu cầu tăng năm mươi phần trăm thì sao".

---

## Kết luận

Toàn bộ luồng từ lúc doanh nghiệp tải tệp dữ liệu đến lúc nhận báo cáo mất từ năm đến mười lăm phút tuỳ kích thước dữ liệu. Doanh nghiệp chỉ phải cung cấp ba loại dữ liệu cơ bản — hồ sơ doanh nghiệp, lịch sử vận chuyển, danh sách kho hiện có. Hệ thống tự gánh phần còn lại: danh bạ kho bãi, lịch mùa vụ, bản đồ giao thông, các phép toán tối ưu phức tạp.

Ba màng lọc xử lý lõi đảm bảo phương án trả ra vừa khả thi vật lý (Màng lọc thứ nhất), vừa chịu được biến động mùa vụ (Màng lọc thứ hai), vừa rẻ nhất có thể trong ràng buộc ngân sách (Màng lọc thứ ba). Báo cáo cuối cùng không chỉ là phân tích — nó là một bản kế hoạch hành động đầy đủ, kèm con số tài chính cụ thể, đủ để Tổng Giám đốc ký duyệt mà không cần đặt câu hỏi thêm.

Đây là điểm khác biệt cốt lõi của hệ thống so với phần mềm tư vấn truyền thống: không dừng ở việc "phân tích cho có" mà tiến tới "ra quyết định thay con người". Vai trò của hệ thống không còn là công cụ — nó đã trở thành một vị Cố vấn Chiến lược Trí tuệ Nhân tạo cho doanh nghiệp, đứng giữa dữ liệu thô và bàn họp Hội đồng Quản trị.
