# InstiForum

InstiForum is a web application designed to facilitate discussions and information sharing within an institute community. This README provides an overview of the project, setup instructions, and a detailed explanation of the code structure.

## Features

- User authentication (login/signup) using ITC SSO
- Create, view, and reply to discussion threads
- Categorize threads by topics
- Search and filter discussions
- Responsive UI for desktop and mobile

## Technologies Used

- **Frontend:** React, Tailwind CSS
- **Backend:** Next.js
- **Database:** Supabase
- **Authentication:** ITC SSO

## Existing Schemas
### Users
| Column Name | Data Type     |
|-------------|--------------|
| id (primary)| UUID                        |
| name        | VARCHAR                     |
| roll        | VARCHAR                     |
| degree      | text                        |
| department  | text                        |
| role        | text                        |
| created_at  | timestamp with time zone    |

### Posts

| Column Name   | Data Type                  |
|---------------|---------------------------|
| id (primary)  | bigint                    |
| created_at    | timestamp with time zone  |
| user_id       | uuid                       |
| community_id  | bigint                     |
| title         | text                       |
| content       | text                       |
| image_url     | text                       |
| upvotes       | bigint                     |
| downvotes     | bigint                     |
| flair         | text                       |

### Comments
| Column Name  | Data Type                  |
|--------------|---------------------------|
| id           | bigint                    |
| created_at   | timestamp with time zone  |
| post_id      | bigint                    |
| parent_id    | bigint                    |
| content      | text                      |
| upvotes      | bigint                    |
| downvotes    | bigint                    |
| user_id      | uuid                      |


## Getting Started

### Prerequisites

- Javascript
- React.js
- Supabase
- Next.js

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/instiforum.git
    cd instiforum
    ```
2. Install dependencies:
    ```bash
    npm install
    cd client
    npm install
    ```
3. Set up environment variables:
    - Create a `.env` file in the root directory with your Supabase URI and secret.

4. Start the development servers:
    ```bash
    npm run dev
    cd client
    npm start
    ```
## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes
4. Push to the branch
5. Open a pull request

## Contact

For questions or feedback, open an issue or contact the maintainer.
