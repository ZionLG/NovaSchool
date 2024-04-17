import BottomBar from "./BottomBar";
import Header from "./Header";
type LayoutProps = {
  children: React.ReactNode;
};
export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col justify-between h-full">
      <style global jsx>{`
        html,
        body,
        div#__next {
          height: 100%;
        }
      `}</style>
      <main className=" grow">{children}</main>
      <BottomBar />
    </div>
  );
}
