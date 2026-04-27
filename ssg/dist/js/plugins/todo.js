"use strict"


let tBody = document.querySelector("tbody.table_body")
const tbodyEntry = document.querySelector("tbody.table_entry")
let budget = document.getElementById('budget')
let currentWallet = document.getElementById('currentWallet')
let totalPnl = document.getElementById('totalPnl')
let totalPnlPct = document.getElementById("totalPnlPct")
const saveBtn = document.querySelector('.savebtn')


let coinName = document.getElementById("coinName")
let tradeDate = document.getElementById("tradeDate")
let pnl = document.getElementById("pnl")
let tableOrder = 1

saveBtn.addEventListener('click', function(){
     const firstBudget = budget.value;
     
     currentWallet.innerText = budget.value
     totalPnl.innerText = "$" + totalPnl.value
     totalPnlPct.innerText = "%" + totalPnlPct.value
     
     
})

//reset butonu
const resetBtn = document.querySelector('.resetbtn')
resetBtn.addEventListener('click', function(){
 if (confirm("Tüm bilgileriniz sıfırlanacaktır!") == true) ((tBody.innerHTML = `<tr></tr>`), (tableOrder = 1))
})

//kasa güncelleme




//positionSide seçimi
let positionSide = document.querySelector('.form-select')

positionSide.addEventListener("change", function () {
  return this.value;
})

//add btn seçimi
const addBtn = document.querySelector('.addbtn')

addBtn.addEventListener('click', function(){
     coinName = document.getElementById('coinName').value
     tradeDate = document.getElementById('tradeDate').value
     pnl = document.getElementById("pnl").value
    let newOrder = tableOrder++;


    tBody.innerHTML += `
        <td>${newOrder}</td>
        <td >${coinName}</td>
        <td>${tradeDate}</td>
        <td>${positionSide.value}</td>
        <td data-pnl="true">${pnl}</td>
        <td>pnlPct</td>
        <td><button type="button" class="removebtn btn btn-danger w-100">Sil</button></td> `

//data-pnl value alma 

let addedPnl = document.querySelectorAll('[data-pnl]').value
let updateWallet = function () {
  return (currentWallet.innerText = Number(budget.value) + Number(addedPnl))
}
 //add btn dan sonra güncel kasa güncellenmeli function gelecek
 updateWallet();
})

//delete butonu


//sonra yapılacaklar 
//1. tüm yeni rowlara seçici eklenecek
//2. silme butonu eklenecek
//3. hesaplama fonksiyonları yapılacak

