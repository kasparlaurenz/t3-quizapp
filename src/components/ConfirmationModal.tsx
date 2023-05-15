import type { FC } from "react";

type statusType = "erstellt" | "geupdated" | "gelöscht";
interface ConfirmModalProps {
  handleModal: () => void;
  status: statusType;
  type?: string;
}
const ConfirmModal: FC<ConfirmModalProps> = ({ handleModal, status, type }) => {
  return (
    <div className="absolute z-50">
      <p className="text-lg">
        {type ?? type} wurde {status}{" "}
      </p>
      <button onClick={handleModal} className="reg-button mt-4">
        Schließen
      </button>
    </div>
  );
};

export default ConfirmModal;
