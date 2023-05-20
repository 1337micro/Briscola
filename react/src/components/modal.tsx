import React, { useState } from "react";
import { Button, Form, Input, Modal } from "antd";

import "./modal.css";

interface CreateButtonProps {
  onOk: () => void;
}

const CreateButton : React.FC<CreateButtonProps> = ({ onOk }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOk = () => {
    form.validateFields().then(() => {
      onOk();
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  return (
    <div className="createButton">
      <Button
        className="primary-button"
        size="large"
        type="primary"
        onClick={showModal}
      >
        Create Game
      </Button>
      <Modal
        title="Game Options"
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={[
          <Button
            key="cancel"
            onClick={handleCancel}
            className="custom-cancel-button"
          >
            Cancel
          </Button>,
          <Button key="ok" onClick={handleOk} className="custom-ok-button">
            Play
          </Button>
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="playerName"
            rules={[{ required: true, message: "Please enter a player name" }]}
          >
            <Input placeholder="Enter a Player Name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CreateButton ;
