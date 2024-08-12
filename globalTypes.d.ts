type ComponentRouteHandler = () => string;
type ComponentRoute = {
  path: string;
  handler: ComponentRouteHandler;
};

interface ComponentProps {
  [key: string]: string | Array<string | ComponentProps>;
}
interface TextInputProps extends ComponentProps {
  label: string;
  name: string;
}
type ComponentRenderer = (props: ComponentProps) => string;

type Component = {
  id: string;
  api: Record<string, ComponentRoute>;
  render: ComponentRenderer;
};

type HtmlProps = {
  path: string;
  meta: Record<string, string>;
};
