import { Bounce, toast } from "react-toastify";
import { ErrorContent } from "./ErrorContent";

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

