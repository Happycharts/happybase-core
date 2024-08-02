## 😜 Happybase: Client-side data-sharing fit for security aware teams 
![Happybase](./public/banner.png)

*"Happybase stands firmly with the people of Occupied Palestine, as we have from the beginning. We are a community of technologists, designers, and developers who are committed to using our skills and talents to create a better world for all. 🇵🇸🇵🇸🇵🇸"*

Welcome to Happybase, a fair-source data-sharing platform built to enable enterprise teams to build hosted data sharing portals using tools like Notion and Hex while monetzing their data via Stripe Connect. 

![localhost_3000_home](https://github.com/user-attachments/assets/7f8540c7-47da-4c02-90fa-0519cf909c6d)

### 🤔 Why tho?

We built Happybase as a response to closed tools like [Prequel](https://www.prequel.co/) and [Census Embedded ETL](https://www.getcensus.com/embedded) that go so far as even requiring a direct and raw data connection to your data warehouse. We believe that data should be shared, but we aren't fans of the approach that allows any customer to run a `SELECT * FROM table` query against your data.

Our approach stands out by using client-side data sharing and sementic layer tools which have built in security contexts such as Cube to enable data sharing without exposing your data to the world. By using a client-side data sharing approach along with JWT, we can ensure your ability to share data on your terms while still allowing your customers to access the data they need.

### 🤓 How does it work?

The internals of Happybase are built around a few key concepts:

- **IFrame Portals**: Happybase uses IFrames to create a secure data sharing environment for your customers.
- **JWT**: JWT is used to authenticate and authorize users to access data.
- **Semantic Layer**: Semantic layer is used to create a data sharing layer that is easy to understand and use.

### 🚀 Getting Started

To get started with Happybase, you'll need to install the following dependencies:

- [Node.js](https://nodejs.org/en/)
- [Pnpm](https://pnpm.io/)

Once you have the dependencies installed, you can run the following commands to start the development server:
```bash
pnpm install
pnpm run dev
