"use strict"

let sermaye = document.getElementById("sermaye")
let winRate = document.getElementById("winRate")
let sermayeOrani = document.getElementById("sermayeOrani")
let kacIslem = document.getElementById("kacIslem")
let profitOrani = document.getElementById("profitOrani")
let profitResult = document.getElementById("profitResult")
let lastSermaye = document.getElementById("lastSermaye")
let calculateBtn = document.getElementById("calculate")
let resetBtn = document.getElementById("reset")
let bilesik = document.getElementById("bilesikSermaye")
let sabit = document.getElementById("sabitSermaye")

// Pozisyon sermayesi = Sermaye*sermaye %'si // iki seçenek olacak biri bileşik(kazandıkça artan) diğer sabit
// kaç işlem = işlem sayısı
// toplam kazanç = profit*kaç işlem
const resetEntries = function () {
  sermaye.value = 100
  winRate.value = 100
  sermayeOrani.value = 10
  kacIslem.value = 5
  profitOrani.value = 10
  lastSermaye.textContent = "0"
  profitResult.textContent = "0"
}

//reset butonu
resetBtn.addEventListener("click", () => {
  resetEntries()
})

//profit calc
// profit = pozisyon sermayesi*profit %'si

const profitCalc = function () {
  return Math.trunc(((sermaye.value * sermayeOrani.value) / 100) * profitOrani.value) / 100
}

//2. bileşik profit hesabı
//3. sabit profit hesabı

calculateBtn.addEventListener("click", () => {
  if (sabit.checked) {
    profitResult.textContent = profitCalc() * kacIslem.value
    lastSermaye.textContent = profitCalc() * kacIslem.value + Number(sermaye.value)
  } else if (bilesik.checked) {
    let firstSermaye = Number(sermaye.value);
    for (let i = 0; i < kacIslem.value; i++) {
      sermaye.value = Number(sermaye.value) + profitCalc();
    } 
    profitResult.textContent = (Number(sermaye.value) - firstSermaye ).toFixed(2)
     lastSermaye.textContent = (Number(sermaye.value).toFixed(2))
     sermaye.value = firstSermaye
     console.log(sermaye.value, profitCalc())
  } else {
    alert("lütfen sermaye tipi seçiniz!")
  }
 
})
resetEntries()
