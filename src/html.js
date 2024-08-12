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
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
      <link rel="manifest" href="/site.webmanifest">
      ${styles}
      ${js}
    </head>
    <body>
      ${app}
    </body>
</html>
`;
}
