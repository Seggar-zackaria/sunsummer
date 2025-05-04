interface PageWrapperProps {
  children: React.ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return <section className="flex h-screen flex-1 flex-col gap-4 p-4 ">{children}</section>;
}