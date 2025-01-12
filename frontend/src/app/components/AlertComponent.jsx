import React from "react";
import { Alert } from "@nextui-org/react";

const AlertComponent = ({ alertMessage, alertColor, onClose }) => {
  if (!alertMessage) return null;

  return (
    <div className="flex justify-center p-4">
      <Alert
        color={alertColor}
        description={alertMessage}
        isVisible={true}
        title={alertColor === 'success' ? 'Success' : 'Error'}
        variant="faded"
        onClose={onClose}
      />
    </div>
  );
};

export default AlertComponent;
