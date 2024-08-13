export function html(
  /** @type HtmlProps */ props,
  /** @type string */ app,
  /** @type string */ js,
  /** @type string */ styles,
  /** @type Record<string, any> */ state
) {
  return `
<!DOCTYPE html>
<html lang="fi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>${props.meta.title}</title>
      ${styles}
      ${js}
    </head>
    <body>
      ${app}
    </body>
</html>
`;
}
