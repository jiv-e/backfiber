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
      <title>${state.meta.title}</title>
      <meta name="description" content="${state.meta.description}">
      <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@600&display=swap" rel="stylesheet">
      ${styles}
      ${js}
    </head>
    <body>
      ${app}
    </body>
</html>
`;
}
