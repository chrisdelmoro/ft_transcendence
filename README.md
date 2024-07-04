<div id="top"></div>

<!-- PROJECT SHIELDS -->
<br/>
<p align="center">
    <img src="https://github.com/chrisdelmoro/ft_transcendence/blob/main/resources/repo/ft_transcendencem.png" alt="Logo" width="150" height="150">

  <p align="center">
    The final project from the École 42 common core!
    <br/>
    <img src="https://img.shields.io/badge/Mandatory-OK-brightgreen"/>
    <img src="https://img.shields.io/badge/Bonus-OK-brightgreen"/>
    <img src="https://img.shields.io/badge/Final%20Score-120-blue"/>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#uninstallation">Uninstallation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![ft_transcendence][product-screenshot]](https://github.com/chrisdelmoro/ft_transcendence/blob/main/resources/repo/demo.gif)

The ft_transcendence project at is an advanced project focused on full-stack web development. It combines a wide range of technologies and concepts, giving students practical experience in building a complex, real-world web application.

1. **Frontend Development**: Students build a responsive and interactive user interface using modern frontend technologies such as HTML, CSS, and JavaScript. They often use frameworks and libraries like React, Vue.js, or Angular to streamline development and enhance the user experience.

2. **Backend Development**: The project requires the development of a robust backend server to handle application logic, data storage, and user authentication. Commonly used backend technologies include Node.js, Express,js, Django, Ruby on Rails, and databases like PostgreSQL or MongoDB.

3. **User Authentication and Authorization**: Implementing secure authentication and authorization mechanisms is a key part of the project. Students learn about OAuth, JWT (JSON Web Tokens), and session management to ensure that user data is protected and that access is properly controlled.

4. **Real-Time Features**: The project typically includes real-time communication features, such as chat functionalities or live updates, using WebSockets or libraries like Socket.io.

5. **API Development**: Students create and document RESTful APIs or GraphQL endpoints to enable communication between the frontend and backend, as well as potential third-party services.

6. **Database Design and Management**: Proper database design, including schema creation, relationships, indexing, and query optimization, is crucial. Students learn to use ORMs (Object-Relational Mappers) like Sequelize or TypeORM to interact with the database.

7. **DevOps and Deployment**: The project involves deploying the application to a cloud service or server. Students learn about containerization with Docker, continuous integration/continuous deployment (CI/CD) pipelines, and cloud platforms like AWS, Heroku, or DigitalOcean.

8. **Security Best Practices**: Emphasis is placed on implementing security best practices, including input validation, data encryption, and protection against common web vulnerabilities like SQL injection, XSS (Cross-Site Scripting), and CSRF (Cross-Site Request Forgery).

9. **Testing**: Students are encouraged to write unit tests, integration tests, and end-to-end tests to ensure the reliability and stability of their application. Testing frameworks like Jest, Mocha, or Cypress are often used.

10. **Project Management and Collaboration**: Working in teams, students practice agile methodologies, version control with Git, and collaboration tools like GitHub or GitLab. They learn to manage tasks, track progress, and work effectively in a collaborative environment.

The ft_transcendence project is a comprehensive introduction to full-stack web development, providing students with hands-on experience in building a feature-rich, scalable web application. It equips them with the skills necessary to develop and deploy modern web applications, preparing them for careers in web development and software engineering.

<p align="right">(<a href="#top">back to top</a>)</p>



### Built With

* [Bootstrap](https://getbootstrap.com)
* [Django](https://www.djangoproject.com/)
* [PostgreSQL](https://www.postgresql.org/)
* [RabbitMQ](https://www.rabbitmq.com/)
* [ELK Stack](https://www.elastic.co/elastic-stack/)
* [Docker](https://www.docker.com/)

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

To run this project, you need to have installed on your computer the following tools:

* docker
* docker-compose
* make

Besides that, make sure you have the docker service running in your machine. On linux systems, generally you can run the following command to check its status:
```sh
systemctl check docker
```
In case you docker is not running, run:
```sh
sudo systemctl start docker
```

### Installation

1. Clone the repo
```sh
  git clone https://github.com/chrisdelmoro/inception.git
```
2. Run the Makefile on the root of the repo and wait for everything to be setup
```sh
make
```
Docker will make sure to setup the entire project for you. Just leave it to do its job.

### Uninstallation

1. Run the Makefile command to clear everything up with:
```sh
make fclean
```


<p align="right">(<a href="#top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
## Usage
The following directories of the repo have a ```.env.example``` hidden file inside. Make a copy of each inside their respective folders and rename it to simply ```.env```.

Some functionality of the project will not be available due to the impossibility of revealing access tokens to the internal 42 API. The lost functionality includes accessing the game and playing it using an école 42 account.

Access ```https://localhost/``` on your browser of choice. The project is self-signed. At the login screen, you have to create an account to access the game.

At the main menu, you can interact with it in several ways:

* On the top left of the page, you can access your profile. Edit your login credentials, add a profile picture, and see your match history.
* On the top right of the page, you can add friends, accept or refuse friend requests, and access your friend list.
* Below the game options at the center of the page, you can customize your game colors. You will find three presets; by clicking on the gear icon, you can change each color individually, including racket color, ball color, and background color.
* There are three main options for playing the game: Solo mode, Challenge mode, and Tournament mode:
    * **Solo Mode:** Here you can play a single game against the AI.
    * **Challenge Mode:** Here you can play a single game against a human opponent. Your opponent has to have an account and log in to the game to play against you. The results of this match will be stored in the match history on both your profiles.
    * **Tournament Mode:** Here you can play tournaments with up to eight players! There is a minimum of three participants, and all must have accounts. As above, the results will be stored in the match history on the respective players' profiles.

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- LICENSE -->
## License

Distributed under the [GNU General Public License version 3 (GPLv3)](https://www.gnu.org/licenses/gpl-3.0.html). 

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- CONTACT -->
## Contact

Christian C. Del Moro - christian.delmoro@protonmail.com

Project Link: [https://github.com/chrisdelmoro/ft_transcendence](https://github.com/chrisdelmoro/ft_transcendence)

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[product-screenshot]: https://github.com/chrisdelmoro/ft_transcendence/blob/main/resources/repo/demo.gif