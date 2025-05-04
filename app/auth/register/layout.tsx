const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="w-full ">{children}</div>
    </div>
  );
};

export default AuthLayout;
