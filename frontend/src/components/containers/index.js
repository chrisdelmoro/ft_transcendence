
const Container = ({ title, className, children }) => {
  return `
    <div class="container-my ${className} ">
      ${title !== "" ? `<h1>${title}</h1>` : ""}
      ${children}
    </div>
  `
};

export default Container;
