# InstiForum

InstiForum is a web application designed to facilitate discussions and information sharing within an institute community.
The idea behind Insti Forum came from a very simple observation — despite having an IIT Bombay subreddit, we realized that there’s no dedicated platform where students and members of the campus community can engage in meaningful discussions on a variety of topics. The subreddit is limited to just one community, and not everyone prefers using Reddit.

So, we decided to build our very own social discussion platform, tailored specifically for IIT Bombay — something that feels like a mix of a social media platform and a forum, designed to make campus conversations more open, organized, and accessible.

This README provides an overview of the project, setup instructions, and a detailed explanation of the code structure.

## Features

- User authentication (login/signup) using ITC SSO
- Create, view, and reply to discussion threads
- Search and filter discussions

## Technologies Used

- **Frontend:** React, Tailwind CSS
- **Backend:** Next.js
- **Database:** Supabase
- **Authentication:** ITC SSO

## Existing Schemas
(Create Them As it is in supabase project tables- also toggle RLS policies off if facing issues while fetching)
### users
| Column Name | Data Type     |
|-------------|--------------|
| id (primary)| UUID                        |
| name        | VARCHAR                     |
| roll        | VARCHAR                     |
| degree      | text                        |
| department  | text                        |
| role        | text                        |
| created_at  | timestamp with time zone    |

### posts

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

### comments
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
    cd Hello-FOSS-25_Instiforum
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Supabase Setup (Online)

    1. Go to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.  
    2. In your project, open **Settings → API** and copy:
         - **Project URL**
         - **Anon public key**

     3. In your project root, create a `.env` file and add the following lines keeping same variables names:
         ```
        NEXT_PUBLIC_SUPABASE_URL=[yourURL]
        NEXT_PUBLIC_SUPABASE_ANON_KEY=[YourKEY]
        NEXT_PUBLIC_IITSSO_ID=[YourKey] # not necessary
         ```



4. Start the development servers:
    ```bash
    npm run dev
    ```
## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes
4. Push to the branch
5. Open a pull request

## Contact

For questions or feedback, open an issue or contact the maintainer.
