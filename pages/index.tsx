import classNames from "classnames"
import { proxy, useSnapshot } from "valtio"
import buttonStyles from "../styles/button.module.scss"

interface Operation {
  (a: number, b: number): number
}

const state = proxy<{
  result: number,
  input: number,
  round: number,
  decimal: number,
  operator: string | null,
  operation: Operation | null,
}>({
  result: 0,
  input: 0,
  round: 0,
  decimal: 0,
  operator: null,
  operation: null,
})

function operate(operator: string, operation: Operation | null) {
  if (state.operation) {
    state.result = state.operation(state.result, state.input)
  }

  state.operator = operator
  state.operation = operation

  if (state.result == 0) {
    state.result = state.input
  }

  state.input = 0

  state.round = Math.max(state.decimal, state.round)
  state.decimal = 0
}

function input(value: number) {
  if (!state.operation) {
    state.result = 0
  }

  if (state.decimal) {
    state.input += value * Math.pow(0.1, state.decimal)
    state.decimal++
  } else {
    state.input *= 10
    state.input += value
  }
}

function clear() {
  state.result = 0
  state.input = 0
  state.round = 0
  state.decimal = 0
  state.operator = null
  state.operation = null
}

function Result() {

  function calc(length: number): string {
    if (length > 16) {
      return "1.4rem"
    } else if (length > 12) {
      return "2.2rem"
    } else if (length > 8) {
      return "3rem"
    } else {
      return "4rem"
    }
  }

  const snapshot = useSnapshot(state)

  const input = (snapshot.operator ?? "") + " " + (snapshot.input ? snapshot.input.toFixed(snapshot.decimal > 0 ? snapshot.decimal - 1 : 0) : "") + (Number.isInteger(snapshot.input) && snapshot.decimal == 1 ? "." : "")
  const result = snapshot.result.toFixed(snapshot.round > 0 ? snapshot.round - 1 : 0)

  return (
    <div className="px-10">
      {snapshot.input || snapshot.operator ?
        <p className={`text-right`} style={{ fontSize: calc(input.length) }}>{input}</p> :
        <p className={`text-right`} style={{ fontSize: calc(result.length) }}>{result.replace(/\.?0+$/, "") || "0"}</p>
      }
    </div>
  )
}

function Buttons() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gridAutoRows: "1fr",
      gap: "15px",
      padding: "30px",
    }}>
      <button className={buttonStyles.item} onClick={() => clear()}>AC</button>
      <button className={buttonStyles.item} onClick={() => { if (state.input) { state.input *= -1 } else { state.result *= -1 } }}>+/-</button>
      <button className={buttonStyles.item} onClick={() => operate("%", (a, b) => a % b)}>%</button>
      <button className={buttonStyles.item} onClick={() => { operate("/", (a, b) => a / b); state.round = 6 }}>/</button>
      <button className={buttonStyles.item} onClick={() => input(7)}>7</button>
      <button className={buttonStyles.item} onClick={() => input(8)}>8</button>
      <button className={buttonStyles.item} onClick={() => input(9)}>9</button>
      <button className={buttonStyles.item} onClick={() => operate("X", (a, b) => a * b)}>X</button>
      <button className={buttonStyles.item} onClick={() => input(4)}>4</button>
      <button className={buttonStyles.item} onClick={() => input(5)}>5</button>
      <button className={buttonStyles.item} onClick={() => input(6)}>6</button>
      <button className={buttonStyles.item} onClick={() => operate("-", (a, b) => a - b)}>-</button>
      <button className={buttonStyles.item} onClick={() => input(1)}>1</button>
      <button className={buttonStyles.item} onClick={() => input(2)}>2</button>
      <button className={buttonStyles.item} onClick={() => input(3)}>3</button>
      <button className={buttonStyles.item} onClick={() => operate("+", (a, b) => a + b)}>+</button>
      <button className={classNames(buttonStyles.item, buttonStyles.zero)} onClick={() => input(0)}>0</button>
      <button className={buttonStyles.item} onClick={() => { if (!state.decimal) { state.decimal = 1 } }}>.</button>
      <button className={buttonStyles.item} onClick={() => operate("", null)}>=</button>
    </div >
  )
}

export default function Index() {
  return (
    <div className="m-4 w-[calc(750px/2)] h-[calc(1334px/2)] mx-auto bg-black rounded-[50px] text-white flex flex-col justify-end">
      <Result />
      <Buttons />
    </div>
  )
}
