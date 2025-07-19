export const ErrorContent = ({
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
  