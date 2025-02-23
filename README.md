# Next.js Route Generator

A Visual Studio Code extension to boost your Next.js productivity! Automatically create routes, pages, and folder structures with ease. Supports Next.js 14 and 15, with or without the `src` folder.

## Features

- **Create Routes**: Quickly generate new routes for your Next.js project.
- **Dynamic Routes with Params**: Create dynamic routes with parameters (e.g., `[id]`).
- **Folder Structure**: Automatically generates the necessary folder structure (`app`, `pages`, `types`, `components`, etc.).
- **Next.js 14 and 15 Support**: Compatible with both Next.js 14 and 15.

## Installation

1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window or by pressing `Ctrl+Shift+X`.
3. Search for "Next.js Route Generator".
4. Click **Install**.

## Usage

### Create a Basic Route

1. Right-click on the `app` or `pages` folder in your Next.js project.
2. Select **Next Generator > Create Route (Complete)**.
3. Enter the route name (e.g., `service/view`).
4. The extension will create the necessary files and folders.

### Create a Route with Parameters

1. Right-click on the `app` or `pages` folder in your Next.js project.
2. Select **Next Generator > Create Route with Parameters (Next.js 15)** or **Create Route with Parameters (Next.js 14 and earlier)**.
3. Enter the route name (e.g., `service/view`).
4. Enter the parameter name (e.g., `serviceId`).
5. The extension will create the dynamic route folder (e.g., `[serviceId]`) and the necessary files.

## Supported Commands

- **Create Route (Complete)**: Creates a basic route.
- **Create Route with Parameters (Next.js 15)**: Creates a dynamic route compatible with Next.js 15.
- **Create Route with Parameters (Next.js 14 and earlier)**: Creates a dynamic route compatible with Next.js 14 and earlier.

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) for details on how to get started.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.