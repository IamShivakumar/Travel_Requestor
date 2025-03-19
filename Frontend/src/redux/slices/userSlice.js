import {createSlice} from "@reduxjs/toolkit"

const initialState={
    user:JSON.parse(localStorage.getItem("user"))||null,
    isLoggedIn: JSON.parse(localStorage.getItem('loggedIn')),
};
export const userSlice=createSlice({
    name:"user",
    initialState,
    reducers:{
    setUser:(state,action)=>{
        state.user=action.payload.user;
        state.isLoggedIn = true;
    },
    logout(state) {
        state.user = null;
        state.isLoggedIn = false;
      },
    }
})

export const {setUser,logout}=userSlice.actions
export default userSlice.reducer