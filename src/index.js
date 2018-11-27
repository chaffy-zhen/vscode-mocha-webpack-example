export function getRole(user){
    switch(user){
        case "Packy":
            return "admin"
        case "Joan":
            return "reader"
    }
}

export function getUsers(){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve(['Packy', 'Joan'])
        }, 1000)
    })
}