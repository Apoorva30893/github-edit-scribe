import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Row, Col,DatePicker, Typography,Table, Card, Upload, InputNumber, Modal} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import TermsAndConditions from './terms&Conditions';

const { Option } = Select;
const  {Text} = Typography;

const QuotationForm = () => {
  const location = useLocation();
  const { buyerName } = location.state || {}; 

    const [buyer, setBuyer] = useState({});
    const [delivery, setDelivery] = useState({});
    const [price, setPrice] = useState(0);
    const [taxRate, setTaxRate] = useState(18); // Example Tax Rate
    const [total, setTotal] = useState(0);
    const [tax, setTax] = useState(0);
    const [sqNumber, setSqNumber] = useState(); //
    const [items, setItems] = useState(); // State to hold items fetched from backend
    const [dataSource, setDataSource] = useState([]); // State to hold table data
    const [isSave, setIsSave] = useState(false);
    const [isUploadModalVisible, setIsUploadModalVisible] = useState(false); // State to hold
    console.log("buyerName",buyerName)

    useEffect(() => {
        const fetchBuyerDetails = async () => {
            if (buyerName) {
                const response = await axios.get(`http://localhost:5000/getCompany/${buyerName}`);
                setBuyer(response.data[0]);
            }
        };

        fetchBuyerDetails();
        getQuotationNumber();
    }, [buyerName]);

    useEffect(() => {
        // Fetch items from the backend when the component mounts
        fetchItems();
      }, []);
    
      const fetchItems = async () => {
        try {
          const response = await axios.get('http://localhost:5000/getAllItems/'); // Replace with your actual API endpoint
          setItems(response.data);
          console.log(response.data);
        } catch (error) {
          console.error('Error fetching items:', error);
        }
      };
    
      const handleItemChange = (value, record) => {
        const selectedItem = items.find(item => item.id === value);
        const newData = dataSource.map(item => {
          if (item.key === record.key) {
            return {
              ...item,
              itemId: selectedItem.id,
              description: selectedItem.description,
              hsnSacCode: selectedItem.hsnSacCode,
              units: selectedItem.units,
              tax: selectedItem.tax,
              price: selectedItem.price,
            };
          }
          return item;
        });
        setDataSource(newData);
      };
    
      const handleQuantityChange = (value, record) => {
        const newData = dataSource.map(item => {
          if (item.key === record.key) {
            return { ...item, quantity: value };
          }
          return item;
        });
        setDataSource(newData);
      };
    
      const handlePriceChange = (value, record) => {
        const newData = dataSource.map(item => {
          if (item.key === record.key) {
            return { ...item, price: value };
          }
          return item;
        });
        setDataSource(newData);
      };
    
      const handleAddItem = () => {
        const newItem = {
          key: Date.now(),
          itemId: '',
          description: '',
          hsnSacCode: '',
          quantity: 0,
          units: '',
          price: 0,
          tax: 0,
        };
        setDataSource([...dataSource, newItem]);
      };
    


    const getQuotationNumber = async () => {
      const data = {"prefix": "YPE/QTN",
      "startYear": "23",
      "endYear": "24"
    }
      const response = await axios.post('http://localhost:5000/getNextSerialNumber', data);
      setSqNumber(response.data);
      console.log("sqNumber",sqNumber)

    }

    const calculateTotal = async () => {
        const response = await axios.post('http://localhost:5000/calculate', { price, taxRate });
        setTax(response.data.tax);
        setTotal(response.data.total);
    };

    const handleSaveDraft = async () => {
      window.open('/quotation.html', '_blank');
        // const htmlContent = `<html><body>
        //     <h1>Quotation</h1>
        //     <p>Buyer: ${buyer.name}</p>
        //     <p>Delivery: ${delivery.address}</p>
        //     <p>Price: ${price}</p>
        //     <p>Tax: ${tax}</p>
        //     <p>Total: ${total}</p>
        // </body></html>`;

        // const response = await axios.post('http://localhost:5000/generate-pdf', { htmlContent }, { responseType: 'blob' });
        // const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        // const link = document.createElement('a');
        // link.href = window.URL.createObjectURL(pdfBlob);
        // link.download = 'quotation.pdf';
        // link.click();
    };

    useEffect(() => {
        if (price > 0) {
            calculateTotal();
        }
    }, [price]);

    const handleUpload = () =>{
      setIsUploadModalVisible(true);
     }
     const handleUploadCancel =() =>{
      setIsUploadModalVisible(false);
     }
    const data = [
        {
          key: '1',
          itemId: '1',
          itemDescription: 'S890QL 10.0mm x 1500 x 2500',
          hsnCode: '12345',
          quantity: '20',
          units: 'Nos',
          price: '100 ₹',
          tax: '5%',
        },
      ];

    const columns = [
        {
            title: 'Item ID',
            dataIndex: 'itemId',
            render: (text, record) => (
              <Select
                style={{ width: 150 }}
                onChange={(value) => handleItemChange(value, record)}
                value={record.itemId || undefined}
              >
                {data.map(item => (
                  <Option key={item.id} value={item.id}>
                    {item.id}
                  </Option>
                ))}
              </Select>
            ),
          },
        {
          title: 'Item Description',
          dataIndex: 'itemDescription',
          key: 'itemDescription',
        },
        {
          title: 'HSN/SAC Code',
          dataIndex: 'hsnCode',
          key: 'hsnCode',
          render: () => <Select style={{ width: '100%' }} />,
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            render: (text, record) => (
              <InputNumber
                min={0}
                value={record.quantity}
                onChange={(value) => handleQuantityChange(value, record)}
              />
            ),
          },
        {
          title: 'Units',
          dataIndex: 'units',
          key: 'units',
          render: () => (
            <Select defaultValue="Nos" style={{ width: '100%' }}>
                <Option value="Nos">Nos</Option>
            </Select>
        ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            render: (text, record) => (
              <InputNumber
                min={0}
                value={record.price}
                onChange={(value) => handlePriceChange(value, record)}
              />
            ),
          },
        {
          title: 'Tax',
          dataIndex: 'tax',
          key: 'tax',
          render: (text) => `${text}%`,
          //render: (text) => <Input defaultValue={text} />,
        },
        {
            title: 'Total Before Tax',
            dataIndex: 'totalbeforetax',
            key: 'totalbeforetax',
            render: (text) => <Input defaultValue={text} />,
          },
          {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            render: (text) => <Input defaultValue={text} />,
          },
      ];
    
    //   const dataSource = [
    //     {
    //       key: '1',
    //       itemId: '1',
    //       itemDescription: 'S890QL 10.0mm x 1500 x 2500',
    //       hsnCode: '',
    //       quantity: '1',
    //       units: 'Nos',
    //       price: '0 ₹',
    //       tax: '0',
    //     },
    //   ];
    
      return (
        <div className="container">
          <Card title="Sales Quotation" bordered={true} className="card-title">
            <Row gutter={16}>
            <Col span={6}>
                <Card title="Supplier Details" bordered={true}>
                  <p>{supplierDetails.name}</p>
                  <p>{supplierDetails.address}</p>
                  <p>{supplierDetails.Contact}</p>
                  <p>{supplierDetails.GSTIN}</p>
                  <a href="#">Place of Supply</a>
                </Card>
              </Col>
              <Col span={6}>
                <Card title="Buyer Details" bordered={true}>
                  <p>{buyer.buyername || ''}</p>
                  <p>{buyer.buyeraddress || ''}</p>
                  <p>{buyer.buyeremail || ''}</p>
                  <p>{buyer.buyercontact || ''}</p>
                  <p>GSTIN: {buyer.buyergst || ''}</p>
                  <a href="#">Place of Supply</a>
                </Card>
              </Col>
              <Col span={6}>
                <Card title="Delivery Location" bordered={true}>
                  <p>{buyer.deliveryaddress || ''}</p>
                  <p>GSTIN :{buyer.buyergst || ''}</p>
                  <a href="#">Place of Supply</a>
                </Card>
              </Col>
              
              <Col span={6}>
                <Card title="Place of Supply" bordered={true}>
                  <Form layout="vertical">
                    <Form.Item label="City">
                      <Input defaultValue="Bangalore" />
                    </Form.Item>
                    <Form.Item label="State">
                      <Select defaultValue="Karnataka">
                        <Option value="Karnataka">Karnataka</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item label="Country">
                      <Select defaultValue="India">
                        <Option value="India">India</Option>
                      </Select>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
            </Row>
    
            <Row gutter={16} className="mt-16">
              <Col span={24}>
                <Card title="Primary Document Details" bordered={true}>
                  <Form layout="vertical">
                    <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="SQ Number" name="sqNumber">
                        <Input value={sqNumber || ''} disabled />
                        </Form.Item>
                        <Form.Item label="Amendment" name="amendment">
                            <Input placeholder="Amendment" />
                        </Form.Item>
                        <Form.Item label="Enquiry Number" name="enquiryNumber">
                            <Input placeholder="Enquiry Number" />
                        </Form.Item>
                        <Form.Item label="Payment Terms (Days)" name="paymentTerms">
                            <Input placeholder="Payment Terms (Days)" />
                        </Form.Item>
                        <Form.Item label="Delivery Period" name="DeliveryPeriod">
                            <Input placeholder="Delivery Period" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="SQ Date" name="sqDate">
                            <DatePicker style={{ width: '100%' }} placeholder="dd-mm-yyyy" />
                        </Form.Item>
                        <Form.Item label="Delivery/Dispatch Date" name="deliveryDate">
                            <DatePicker style={{ width: '100%' }} placeholder="dd-mm-yyyy" />
                        </Form.Item>
                        <Form.Item label="Enquiry Date" name="EnquiryDate">
                            <DatePicker style={{ width: '100%' }} placeholder="dd-mm-yyyy" />
                        </Form.Item>
                        <Form.Item>
                            <Text>Store*</Text>
                            <Select defaultValue="Sent" style={{ width: '100%' }}>
                                <Option value="Yes Pee Engineering">Yes Pee Engineering</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item label="Customer Enquiry Number" name="customerEnquiryNumber">
                            <Input placeholder="Customer Enquiry Number" />
                        </Form.Item>
                    </Col>
                    </Row>
                  </Form>
                </Card>
              </Col>
            </Row>
    
            <Row gutter={16} className="mt-16">
              <Col span={24}>
                <Card>
                  <Table
        dataSource={data}
        columns={columns}
        pagination={false}
        scroll={{ x: true }}
        className="mt-16"
        rowKey="key"
      />
                </Card>
              </Col>
            </Row>
    
            <Row gutter={16} className="mt-16">
              <Col span={16}>
                <Card>
                  <Form layout="vertical">
                    <TermsAndConditions />
                  </Form>
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Form layout="vertical">
                    <Form.Item label="Total (before tax)">
                      <Input defaultValue="₹2000.00" />
                    </Form.Item>
                    <Form.Item label="Total Tax">
                      <Input defaultValue="₹100.00" />
                    </Form.Item>
                    <Form.Item label="Total (after tax)">
                      <Input defaultValue="₹2100.00" />
                    </Form.Item>
                    <Form.Item label="Grand Total">
                      <Input defaultValue="₹2100.00" />
                    </Form.Item>
                    <Form.Item label="Advance To Pay">
                      <Input />
                    </Form.Item>
                  </Form>
                </Card>
                <Button type="primary" className="mt-16" onClick={handleUpload}>
                  Upload PO
                </Button>
              </Col>
            </Row>
          </Card>
          <Modal
        title="Upload PO"
        open={isUploadModalVisible}
        onCancel={handleUploadCancel}
        width={'60vw'}
      >
        <Form layout="vertical">
                    <Form.Item label="POnumber">
                    <Input placeholder="Enter PO number" />
                    </Form.Item>
                    <Form.Item label="POdocument">
                    <Upload
                    accept="image/*"
                    beforeUpload={(file) => {
                        // const isRequiredFileType =
                        //     file.type === 'image/jpeg' ||
                        //     file.type === 'image/png';
                        // if (!isRequiredFileType) {
                        //     message.error(
                        //         `${file.name} is not an Image file`,
                        //     );
                        // }
                        // return isRequiredFileType;
                        return false;
                    }}
                    name="logo"
                    listType="text"
                    maxCount={1}
                >
                    <Button
                        icon={<UploadOutlined />}
                        content="Upload"
                    />
                </Upload>
                    </Form.Item>
        </Form>
        
      </Modal>
        </div>
      );
    };
export default QuotationForm;
