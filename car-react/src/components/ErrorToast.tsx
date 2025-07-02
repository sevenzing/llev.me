import { Bounce, toast } from "react-toastify";

export const errorToast = (title: string, message: string) => {
  toast.error(<ErrorContent title={title} message={message} />, {
    position: "top-right",
    autoClose: false,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    transition: Bounce,
    style: {
      width: "400px",
    },
  });
};

const ErrorContent = ({
  title,
  message,
}: {
  title: string;
  message: string;
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>{title}</h1>
      <p style={{ fontSize: "16px" }}>{message}</p>
    </div>
  );
};
