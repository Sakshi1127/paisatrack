import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
})

API.interceptors.request.use((config)  =>{
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config   
})


export const register = async(name:string, email:string, password:string) =>{
    const response = await API.post("auth/register",{name,email,password})
    return response.data
}

export const login = async(email:string, password:string)=>{
    const response = await API.post("auth/login",{email,password})
    return response.data
}

export default API