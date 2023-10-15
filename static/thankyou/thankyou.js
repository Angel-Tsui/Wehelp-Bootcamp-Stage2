const url = new URL(window.location.href)
const params = url.searchParams

const number = params.get("number");

const order_number = document.querySelector(".order_number")
order_number.innerText = number

const checkOrder_btn = document.querySelector(".checkOrder");
checkOrder_btn.addEventListener("click", () => {
    window.location.href = "/order";
})