## 😜 Happybase: Collaborative data for normies
![Happybase](./public/sqlfornormies.png)

"Happybase stands firmly with the people of Occupied Palestine, as we have from the beginning. We are a community of technologists, designers, and developers who are committed to using our skills and talents to create a better world for all. 🇵🇸🇵🇸🇵🇸"

Welcome to Happybase, a SQL collaboration platform with a notion-like interface to provide seamless integration with your data sources and powerful generative AI capabilities (soon). This README will dive into the architecture, key components, and routes of Happybase.

### 📐 Architecture

Happybase is built on a modern tech stack that ensures scalability, security, and ease of use. Here's an overview of the core components:

#### Shadcn

Shadcn is used to build the UI components of Happybase. It provides a robust and flexible foundation for creating a responsive and aesthetically pleasing user interface.

#### Clerk Auth

Clerk is integrated for authentication, ensuring secure and seamless user management. It handles user sign-up, login, and organization management, providing a smooth user experience.

#### Supabase

Supabase serves as the backend database and real-time server. It offers an easy-to-use interface for managing database operations, authentication, and real-time updates.

#### App Router

The App Router is used to manage the application's navigation and routing. It ensures smooth transitions between different sections of the dashboard and API routes.

### 🎛️ Dashboard Routes

Happybase has several key routes for managing data sources and viewing dashboards:

#### `/dashboard/sources/`

This route allows users to add new data sources to their dashboard. Users can connect various data sources including Semantic Layers such as Cube.

#### `/dashboard/home`

The home route serves as the main dashboard view, where users can see an overview of their data sources, charts, and analytics.

#### `/dashboard/documents`

This route allows users to view and interact with their documents.

### ⚙️ API Routes

Happybase provides API routes to manage data sources and handle chat interactions:

#### `/api/sources/add`

This API route handles the addition of new data sources to the user's dashboard.

#### `/api/sources/get/`

This API route manages the fetching of sources from Supabase in a multi-tenant fashion based on the organization ID.

#### `/api/documents/add/`

This API route creates documents with an ID schema based on Segment's KSUID. It also handles the creation of new documents and the addition of new data to existing documents.

### 🪄 Velt Realtime Collaboration

Happybase uses Velt to power realtime collaboration between multiple users in a Figma-esque interface. Users can create documents, add data to documents, and comment on documents.

#### In document SQL querying

Happybase allows users to query their data sources such as Clickhouse straight from a Notion-like interface. In the future, I hope to build in chart components and other visualization capabilities. 

With these tools and functionalities, Happybase offers a seamless experience for managing SQL. We hope this README helps you understand the architecture and capabilities of Happybase. Happy charting!

### 🤝 Contributing Guidelines

Thank you for considering contributing to our project! Please follow these guidelines for smooth collaboration:

1. Fork the repository and create your branch from master.

2. Ensure your code adheres to our coding standards and conventions.

3. Test your changes thoroughly and add a test case in the tests folder.

4. Submit a pull request with a clear description of the problem and solution.