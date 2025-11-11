


fetch("data/user.json")
    .then(response => response.json())
    .then(values => values.forEach(value=>console.log(value.email)));
   


display("Hello",4);
  display("Hello",5); 
 const display = (fa,four) => console.log(fa,four) 
   