import Header from "./Header";
type LayoutProps = {
  children: React.ReactNode;
};
export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <style global jsx>{`
        html,
        body,
        div#__next {
          height: 100%;
        }
        div#__next {
          display: flex;
          flex-direction: column;
        }
      `}</style>
      <main className=" grow">{children}</main>
    </>
  );
}
