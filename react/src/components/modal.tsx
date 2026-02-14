import React, { useState } from "react";
import { Button, Form, Input, Modal } from "antd";

import "./modal.css";

interface CreateButtonProps {
  onOk: (playerName: string) => void;
}

const CreateButton: React.FC<CreateButtonProps> = ({ onOk }) => {

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
      const playerName = form.getFieldValue("playerName");
      onOk(playerName);
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  return (
    <>
      <Button
        className="primary-button"
        size="large"
        type="primary"
        onClick={showModal}
      >
        Create Game
      </Button>
      <Modal
        className="custsomModal"
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
            <Input placeholder="Enter a Lobby Name" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CreateButton;

