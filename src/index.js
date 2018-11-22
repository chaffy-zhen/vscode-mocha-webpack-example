export function getRole(user){
    switch(user){
        case "Packy":
            return "admin"
        case "Joan":
            return "reader"
    }
}