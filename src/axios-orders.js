import axios from 'axios';

const instance = axios.create({
    baseURL: 'https://react-build-a-burger-60ef4.firebaseio.com/'
});

export default instance;