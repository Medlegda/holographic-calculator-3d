"use client"

import { useState, useRef, Suspense, useCallback, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Environment, OrbitControls, Sparkles, Stars } from "@react-three/drei"
import * as THREE from "three"

const themes = {
  holographic: {
    name: "🌟 Holographic",
    bg: "from-purple-900 via-blue-900 to-black",
    primary: "#00FFFF",
    secondary: "#FF073A",
    accent: "#39FF14",
    particles: "rainbow",
  },
  neon: {
    name: "⚡ Neon City",
    bg: "from-pink-900 via-purple-900 to-black",
    primary: "#FF1493",
    secondary: "#00FF00",
    accent: "#FFFF00",
    particles: "neon",
  },
  cosmic: {
    name: "🌌 Cosmic",
    bg: "from-indigo-900 via-purple-900 to-black",
    primary: "#9370DB",
    secondary: "#FFD700",
    accent: "#FF69B4",
    particles: "cosmic",
  },
  matrix: {
    name: "💚 Matrix",
    bg: "from-green-900 via-black to-green-900",
    primary: "#00FF00",
    secondary: "#008000",
    accent: "#90EE90",
    particles: "matrix",
  },
}

export default function HolographicCalculator() {
  const [display, setDisplay] = useState("0")
  const [previousValue, setPreviousValue] = useState(null)
  const [operation, setOperation] = useState(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)
  const [history, setHistory] = useState([])
  const [theme, setTheme] = useState("holographic")
  const [lastPressed, setLastPressed] = useState(null)
  const [error, setError] = useState(false)

  const currentTheme = themes[theme]

  const calculate = useCallback((firstOperand, secondOperand, operation) => {
    switch (operation) {
      case "+":
        return firstOperand + secondOperand
      case "-":
        return firstOperand - secondOperand
      case "×":
        return firstOperand * secondOperand
      case "÷":
        return secondOperand !== 0 ? firstOperand / secondOperand : "Error"
      default:
        return secondOperand
    }
  }, [])

  const inputNumber = useCallback(
    (num) => {
      setLastPressed(num)
      setError(false)

      if (waitingForOperand) {
        setDisplay(String(num))
        setWaitingForOperand(false)
      } else {
        setDisplay((prev) => (prev === "0" ? String(num) : prev + num))
      }
    },
    [waitingForOperand],
  )

  const inputOperation = useCallback(
    (nextOperation) => {
      const inputValue = Number.parseFloat(display) || 0
      setLastPressed(nextOperation)
      setError(false)

      if (previousValue === null) {
        setPreviousValue(inputValue)
      } else if (operation) {
        const currentValue = previousValue || 0
        const newValue = calculate(currentValue, inputValue, operation)

        if (newValue === "Error") {
          setError(true)
          setDisplay("Error")
          setPreviousValue(null)
          setOperation(null)
          setWaitingForOperand(true)
          return
        }

        setDisplay(String(newValue))
        setPreviousValue(newValue)

        setHistory((prev) => [
          ...prev.slice(-3),
          {
            calculation: `${currentValue} ${operation} ${inputValue} = ${newValue}`,
            result: newValue,
            id: Date.now(),
          },
        ])
      }

      setWaitingForOperand(true)
      setOperation(nextOperation)
    },
    [display, previousValue, operation, calculate],
  )

  const performCalculation = useCallback(() => {
    const inputValue = Number.parseFloat(display) || 0
    setLastPressed("=")

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation)

      if (newValue === "Error") {
        setError(true)
        setDisplay("Error")
      } else {
        setDisplay(String(newValue))
        setHistory((prev) => [
          ...prev.slice(-3),
          {
            calculation: `${previousValue} ${operation} ${inputValue} = ${newValue}`,
            result: newValue,
            id: Date.now(),
          },
        ])
      }

      setPreviousValue(null)
      setOperation(null)
      setWaitingForOperand(true)
    }
  }, [display, previousValue, operation, calculate])

  const clear = useCallback(() => {
    setDisplay("0")
    setPreviousValue(null)
    setOperation(null)
    setWaitingForOperand(false)
    setLastPressed("C")
    setError(false)
  }, [])

  const getOperationColor = useCallback(
    (op) => {
      switch (op) {
        case "+":
          return currentTheme.accent
        case "-":
          return currentTheme.secondary
        case "×":
          return currentTheme.primary
        case "÷":
          return currentTheme.accent
        case "=":
          return "#FFD700"
        default:
          return currentTheme.primary
      }
    },
    [currentTheme],
  )

  // Clear last pressed after animation
  useEffect(() => {
    if (lastPressed) {
      const timer = setTimeout(() => setLastPressed(null), 200)
      return () => clearTimeout(timer)
    }
  }, [lastPressed])

  return (
    <div className={`w-full h-screen bg-gradient-to-b ${currentTheme.bg} overflow-hidden transition-all duration-1000`}>
      {/* 2D Calculator Overlay - Responsive positioning */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none p-4">
        <div className="pointer-events-auto w-full max-w-sm">
          <Calculator2D
            display={display}
            lastPressed={lastPressed}
            error={error}
            theme={currentTheme}
            onNumberClick={inputNumber}
            onOperationClick={inputOperation}
            onEqualsClick={performCalculation}
            onClearClick={clear}
            getOperationColor={getOperationColor}
          />
        </div>
      </div>

      {/* 3D Background Effects */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        className="absolute inset-0"
      >
        <Suspense fallback={null}>
          <Scene3D theme={currentTheme} history={history} />
        </Suspense>
      </Canvas>

      {/* Theme Selector - Responsive positioning */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="bg-black/70 border-2 text-white rounded-lg px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all"
          style={{
            borderColor: currentTheme.primary,
            focusRingColor: currentTheme.primary,
          }}
        >
          {Object.entries(themes).map(([key, themeData]) => (
            <option key={key} value={key} className="bg-black text-white">
              {themeData.name}
            </option>
          ))}
        </select>
      </div>

      {/* History Panel - Responsive positioning and sizing */}
      {history.length > 0 && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 max-w-[200px] sm:max-w-xs">
          <div className="bg-black/70 rounded-lg p-2 sm:p-3 border-2" style={{ borderColor: currentTheme.primary }}>
            <h3 className="text-xs sm:text-sm font-bold mb-1 sm:mb-2" style={{ color: currentTheme.primary }}>
              Recent
            </h3>
            {history.slice(-2).map((item) => (
              <div key={item.id} className="text-[10px] sm:text-xs mb-1 text-white/80 truncate">
                {item.calculation}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions - Responsive positioning and text */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 text-white/60 text-xs sm:text-sm z-20">
        <p className="hidden sm:block">✨ Fully functional calculator with magical 3D effects</p>
        <p className="sm:hidden">✨ Magical calculator</p>
      </div>
    </div>
  )
}

function Calculator2D({
  display,
  lastPressed,
  error,
  theme,
  onNumberClick,
  onOperationClick,
  onEqualsClick,
  onClearClick,
  getOperationColor,
}) {
  const buttons = [
    ["C", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ]

  return (
    <div
      className="bg-black/40 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-6 border-2 shadow-2xl w-full"
      style={{ borderColor: theme.primary, boxShadow: `0 0 30px ${theme.primary}40` }}
    >
      {/* Display - Responsive sizing */}
      <div
        className="mb-3 sm:mb-6 p-3 sm:p-4 bg-black/60 rounded-lg sm:rounded-xl border-2"
        style={{ borderColor: error ? theme.secondary : theme.primary }}
      >
        <div
          className="text-right text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-white min-h-[2rem] sm:min-h-[3rem] flex items-center justify-end overflow-hidden"
          style={{
            color: error ? theme.secondary : theme.primary,
            textShadow: `0 0 10px ${error ? theme.secondary : theme.primary}`,
            filter: `drop-shadow(0 0 5px ${error ? theme.secondary : theme.primary})`,
          }}
        >
          <span className="truncate">{display}</span>
        </div>
      </div>

      {/* Buttons Grid - Responsive sizing */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {buttons.map((row, rowIndex) =>
          row.map((button, colIndex) => {
            const isPressed = lastPressed === button
            const isOperation = ["+", "-", "×", "÷", "="].includes(button)
            const isNumber = !isNaN(button) || button === "."
            const isWide = button === "0"

            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => {
                  if (button === "C") onClearClick()
                  else if (button === "=") onEqualsClick()
                  else if (["+", "-", "×", "÷"].includes(button)) onOperationClick(button)
                  else if (isNumber) onNumberClick(button)
                }}
                className={`
                  h-12 sm:h-14 lg:h-16 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all duration-150 border-2
                  ${isWide ? "col-span-2" : ""}
                  ${isPressed ? "scale-95" : "hover:scale-105"}
                  ${isOperation ? "text-black" : "text-white"}
                  active:scale-90 touch-manipulation
                `}
                style={{
                  backgroundColor: isOperation ? getOperationColor(button) : "rgba(255,255,255,0.1)",
                  borderColor: isPressed ? theme.accent : isOperation ? getOperationColor(button) : theme.primary,
                  boxShadow: isPressed
                    ? `inset 0 0 20px ${theme.accent}40`
                    : `0 0 15px ${isOperation ? getOperationColor(button) : theme.primary}30`,
                  textShadow: isOperation ? "none" : `0 0 5px ${theme.primary}`,
                }}
              >
                {button}
              </button>
            )
          }),
        )}
      </div>
    </div>
  )
}

function Scene3D({ theme, history }) {
  return (
    <>
      <Environment preset="night" />
      <Stars radius={300} depth={60} count={2000} factor={4} />

      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color={theme.primary} />
      <pointLight position={[-10, -10, 10]} intensity={0.5} color={theme.secondary} />

      {/* Floating History Orbs */}
      <HistoryOrbs history={history} theme={theme} />

      {/* Theme-based Particle Effects */}
      <ParticleSystem theme={theme} />

      {/* Ambient Sparkles */}
      <Sparkles count={50} scale={30} size={3} speed={0.3} color={theme.primary} />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.2}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  )
}

function HistoryOrbs({ history, theme }) {
  return (
    <group>
      {history.map((item, index) => {
        const angle = (index * Math.PI * 2) / Math.max(history.length, 3)
        const radius = 6
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = Math.sin(index * 0.5) * 2

        return (
          <Float key={item.id} speed={1 + index * 0.3} rotationIntensity={0.1} floatIntensity={0.5}>
            <mesh position={[x, y, z]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial
                color={theme.accent}
                emissive={theme.accent}
                emissiveIntensity={0.3}
                transparent
                opacity={0.7}
              />
            </mesh>
            <Sparkles count={5} scale={0.5} size={1} speed={2} color={theme.accent} />
          </Float>
        )
      })}
    </group>
  )
}

function ParticleSystem({ theme }) {
  const particlesRef = useRef()

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  const particleCount = 300
  const positions = []
  const colors = []

  for (let i = 0; i < particleCount; i++) {
    positions.push((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40)

    const color = new THREE.Color()
    switch (theme.particles) {
      case "rainbow":
        color.setHSL(Math.random(), 1, 0.6)
        break
      case "neon":
        color.set(Math.random() > 0.5 ? theme.primary : theme.secondary)
        break
      case "cosmic":
        color.setHSL(0.7 + Math.random() * 0.3, 1, 0.6)
        break
      case "matrix":
        color.set(theme.primary)
        break
      default:
        color.set(theme.primary)
    }

    colors.push(color.r, color.g, color.b)
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={new Float32Array(positions)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={new Float32Array(colors)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}
