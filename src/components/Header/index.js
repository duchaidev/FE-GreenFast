import {
  Button,
  Col,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Modal,
  Row,
  Select,
  message,
} from "antd";
import { Link, NavLink } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import "./styles.css";
import { useEffect, useRef, useState } from "react";
import { deleteCookie } from "./../../utils/Cookie";
import { editUserCustomer, updateStaff } from "../../Services/AuthAPI";
import dayjs from "dayjs";
import { getAllArea } from "../../Services/ManagementServiceAPI";
import { fetchTableCategory, getQR } from "../../Services/OrderAPI";
import {
  fetchDataNotifi,
  fetchQuantityNotifi,
} from "../../Services/Notification";

const Header = () => {
  const [us, setUs] = useState({});
  const user = sessionStorage.getItem("user");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenQR, setIsModalOpenQR] = useState(false);
  const [form] = Form.useForm();
  const [getArea, setGetArea] = useState([]);
  const [area, setArea] = useState();
  const [tableList, setTableList] = useState([]);
  const [table, setTable] = useState();
  const [qr, setQR] = useState();
  const [quantityNotifi, setQuantityNotifi] = useState(0);
  const [dataNotifi, setDataNotifi] = useState([]);
  const [isShowNotifi, setIsShowNotifi] = useState(false);
  const notifiRef = useRef(null);

  const handleClickOutside = (event) => {
    if (notifiRef.current && !notifiRef.current.contains(event.target)) {
      setIsShowNotifi(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchQuantityNotificaiton = async () => {
    try {
      const res = await fetchQuantityNotifi();
      setQuantityNotifi(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchDtNotificaiton = async () => {
    try {
      const res = await fetchDataNotifi();
      setDataNotifi(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchQuantityNotificaiton();
    fetchDtNotificaiton();
  }, []);

  const fetchQr = async (tableId) => {
    try {
      const res = await getQR(tableId);
      setQR(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (table) {
      fetchQr(table);
    }
  }, [table]);
  const fetchTable = async (id) => {
    try {
      const res = await fetchTableCategory(id);
      setTableList(
        res.data?.map((item) => {
          return {
            key: item.slug,
            label: item._id,
            status: item.status,
          };
        })
      );
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (area) {
      fetchTable(area);
    }
  }, [area]);

  useEffect(() => {
    const fetchArea = async () => {
      try {
        const res = await getAllArea();
        setGetArea(
          res.data?.map((item) => {
            return {
              key: item.id,
              label: item.name,
            };
          })
        );
      } catch (error) {
        console.log(error);
      }
    };
    fetchArea();
  }, []);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    onFinish();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  useEffect(() => {
    setUs(JSON.parse(user));
  }, [user]);

  useEffect(() => {
    if (us) {
      form.setFieldsValue({
        full_name: us.full_name,
        birthday: dayjs(us.birthday),
        gender: us.gender,
        phone_number: us.phone_number,
        email: us.email,
        address: us.address,
      });
    }
  }, [us]);
  const handleLogout = () => {
    sessionStorage.removeItem("user");
    deleteCookie("access_token");
    deleteCookie("refreshToken");
    deleteCookie("connect.sid");
    window.location.href = "/login";
  };
  const items = [
    {
      label: <p onClick={showModal}>Sửa thông tin</p>,
      key: "0",
    },
    {
      label: <p onClick={handleLogout}>Đăng xuất</p>,
      key: "1",
    },
  ];
  const onFinish = async () => {
    const values = form.getFieldsValue();

    try {
      if (us.role === "customer") {
        await editUserCustomer({
          ...values,
          birthday: dayjs(values.birthday).format("YYYY-MM-DD"),
        });
        message.success("Cập nhật thông tin thành công");
      } else {
        await updateStaff({
          ...values,
          birthday: dayjs(values.birthday).format("YYYY-MM-DD"),
        });
        message.success("Cập nhật thông tin thành công");
      }
      handleCancel();
    } catch (error) {
      console.log(error);
      message.error(error.response.data.message);
    }
  };

  return (
    <div>
      <Modal
        className="headerModal"
        title="Cập nhật thông tin tài khoản"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="back" danger onClick={handleCancel}>
            ĐÓNG
          </Button>,
          <Button
            type="primary"
            // loading={loading}
            form="form"
            name="form"
            onClick={handleOk}
          >
            Cập nhật
          </Button>,
        ]}
        bodyStyle={{ height: "1280" }}
      >
        <div className="ant_body">
          <Form layout="vertical" form={form} name="form">
            <Row>
              <Col span={24}>
                <Form.Item label="Họ tên" name="full_name">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Ngày sinh" name="birthday">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Giới tính" name="gender">
                  <Select
                    name="gender"
                    placeholder="Chọn giới tính"
                    // onChange={onGenderChange}
                    allowClear
                  >
                    <Select.Option key={1} value={"nam"}>
                      Nam
                    </Select.Option>
                    <Select.Option key={2} value={"nữ"}>
                      Nữ
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Số điện thoại" name="phone_number">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Email" name="email">
                  <Input type="email" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Địa chỉ" name="address">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
      <Modal
        className="headerModal"
        title="Tạo QR"
        open={isModalOpenQR}
        onCancel={() => {
          setIsModalOpenQR(false);
        }}
        footer={[
          <Button
            key="back"
            danger
            type="primary"
            onClick={() => {
              setIsModalOpenQR(false);
            }}
          >
            ĐÓNG
          </Button>,
        ]}
        bodyStyle={{ height: "1280" }}
      >
        <div className="ant_body">
          <div className="flex w-full justify-between py-3">
            <div className="flex flex-col w-[48%] gap-2">
              <span className="font">Chọn tầng</span>
              <Select
                name="gender"
                placeholder="Chọn tầng"
                allowClear
                onChange={(value) => {
                  setArea(value);
                }}
              >
                {getArea?.map((item) => (
                  <Select.Option key={item.key} value={item.key}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col w-[48%] gap-2">
              <span className="font">Chọn bàn</span>
              <Select
                disabled={tableList?.length === 0}
                name="gender"
                placeholder="Chọn bàn"
                allowClear
                onChange={(value) => {
                  setTable(value);
                }}
              >
                {tableList?.map((item) => {
                  if (item.status === 0)
                    return (
                      <Select.Option key={item.key} value={item.label}>
                        {item.label}
                      </Select.Option>
                    );
                })}
              </Select>
            </div>
          </div>

          {qr && (
            <div className="flex items-center justify-center mt-2">
              <img src={qr} alt="" />
            </div>
          )}
        </div>
      </Modal>
      <nav className="navbar navbar-expand-lg navbar-light bg-memu custom flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            <img className="img-hd" alt="logo" src={"../logo.png"} />
          </Link>
          <div className="flex gap-6 ml-5">
            <Link to="/" style={{ fontSize: 18 }}>
              Trang chủ
            </Link>

            {us?.role === "customer" ? (
              <Link to="/order" style={{ fontSize: 18 }}>
                Đặt món
              </Link>
            ) : (
              <div className="flex gap-6">
                {us && (
                  <Link to="/menu-management" style={{ fontSize: 18 }}>
                    Quản lý
                  </Link>
                )}
                <Link to="/order" style={{ fontSize: 18 }}>
                  Đặt món
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <div className="relative " ref={notifiRef}>
            <div
              onClick={() => {
                setIsShowNotifi(!isShowNotifi);
              }}
              className="px-2 hover:bg-[#416b47] rounded-full cursor-pointer transition-all py-[8px]"
            >
              <svg
                width="16"
                height="18"
                viewBox="0 0 16 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.1906 12.3324C15.1258 12.2543 15.0621 12.1762 14.9996 12.1008C14.1402 11.0613 13.6203 10.434 13.6203 7.49141C13.6203 5.96797 13.2559 4.71797 12.5375 3.78047C12.0078 3.08789 11.2918 2.5625 10.3481 2.17422C10.3359 2.16746 10.3251 2.1586 10.316 2.14805C9.97658 1.01133 9.04767 0.25 8.00001 0.25C6.95236 0.25 6.02384 1.01133 5.68439 2.14687C5.67535 2.15706 5.66465 2.16564 5.65275 2.17227C3.45041 3.07891 2.38009 4.81836 2.38009 7.49023C2.38009 10.434 1.86095 11.0613 1.0008 12.0996C0.938296 12.175 0.874624 12.2516 0.80978 12.3312C0.64228 12.5333 0.536156 12.779 0.503965 13.0394C0.471775 13.2999 0.514866 13.5641 0.62814 13.8008C0.869155 14.3086 1.38283 14.6238 1.96916 14.6238H14.0352C14.6188 14.6238 15.1289 14.309 15.3707 13.8035C15.4845 13.5668 15.528 13.3023 15.4961 13.0416C15.4641 12.7809 15.3582 12.5348 15.1906 12.3324ZM8.00001 17.75C8.56448 17.7495 9.1183 17.5963 9.60273 17.3066C10.0872 17.0168 10.4841 16.6014 10.7516 16.1043C10.7642 16.0805 10.7704 16.0538 10.7696 16.0269C10.7689 15.9999 10.7612 15.9736 10.7473 15.9506C10.7333 15.9275 10.7137 15.9084 10.6902 15.8952C10.6667 15.8819 10.6402 15.875 10.6133 15.875H5.38751C5.36053 15.8749 5.33399 15.8818 5.31046 15.895C5.28693 15.9082 5.26723 15.9273 5.25327 15.9504C5.2393 15.9735 5.23156 15.9998 5.23078 16.0268C5.23001 16.0537 5.23623 16.0804 5.24884 16.1043C5.51624 16.6013 5.91316 17.0167 6.39752 17.3065C6.88187 17.5962 7.43561 17.7495 8.00001 17.75Z"
                  fill="white"
                />
              </svg>
              <p className="absolute px-[6px] py-[1px] bg-[#263a29] rounded-2xl text-white -top-2 text-xs -right-2">
                {quantityNotifi || 0}
              </p>
            </div>
            {isShowNotifi && (
              <div className="absolute border right-0 top-10 rounded-md bg-white w-[320px] z-[50]">
                {dataNotifi?.length > 0 ? (
                  dataNotifi?.map((item) => (
                    <div
                      className={`text-black ${
                        item?.isRead ? "" : "bg-slate-100"
                      }  pt-3 px-3 border-b pb-2 hover:bg-gray-100 `}
                      key={item?.id}
                    >
                      <p className="font-semibold mb-2 leading-5">
                        {item?.title || "Không có tiêu đề"}
                      </p>
                      <div className="flex items-center h-auto gap-3">
                        <div className="w-[3px] rounded-full h-[30px] bg-green-500"></div>
                        <span className="text-sm">
                          {item?.message || "Không có nội dung"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-black p-3">Không có thông báo</div>
                )}
              </div>
            )}
          </div>
          {us?.full_name ? (
            <div className="flex items-center gap-4">
              <div>Xin chào, {us?.full_name || "Khách"}</div>
              <Dropdown menu={{ items }} trigger={["click"]}>
                <p className="p-2 bg-white rounded-full">
                  <UserOutlined style={{ color: "black" }} />
                </p>
              </Dropdown>
            </div>
          ) : (
            <NavLink to="/login" style={{ fontSize: 18 }}>
              <Button type="primary">Đăng nhập</Button>
            </NavLink>
          )}
          {us && us?.role !== "customer" && (
            <Button
              type="primary"
              onClick={() => {
                setIsModalOpenQR(true);
              }}
            >
              Tạo QR
            </Button>
          )}
        </div>
      </nav>
    </div>
  );
};
export default Header;
