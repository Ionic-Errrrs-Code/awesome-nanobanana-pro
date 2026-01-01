import type { FC } from 'hono/jsx';

interface LayoutProps {
    title?: string;
    description?: string;
    children: any;
}

export const Layout: FC<LayoutProps> = ({
    title = 'Prompt Base',
    description = 'Browse thousands of AI-generated image and video prompts',
    children
}) => {
    return (
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="description" content={description} />
                <title>{title}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="/styles.css" />
            </head>
            <body>
                <div class="app">
                    {children}
                </div>
                <script src="/app.js"></script>
            </body>
        </html>
    );
};
