$(document).ready(function () {
    const usersKey = 'users';

    function getUsers() {
        return JSON.parse(localStorage.getItem(usersKey)) || [];
    }

    function findUser(username) {
        return getUsers().find(user => user.username === username);
    }

    function authenticateUser(username, password) {
        let user = findUser(username);
        return user && user.password === password;
    }

    $('#login-form').submit(function (e) {
        e.preventDefault();
        let username = $('#login-username').val();
        let password = $('#login-password').val();

        if (authenticateUser(username, password)) {
            Swal.fire({
                icon: 'success',
                title: 'Login Successful',
                text: 'You will be redirected shortly...',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                localStorage.setItem('currentUser', username);
                window.location.href = 'tracker.html';
            });
        } else {
            // If username and password are incorrect, show popup message
            Swal.fire({
                icon: 'error',
                title: 'Login Error',
                text: 'Incorrect username or password!',
                showCancelButton: true,
                confirmButtonText: 'Register',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    // If user chooses to register, redirect to registration page
                    window.location.href = 'register.html';
                }
            });
        }
    });
});
