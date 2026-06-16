import { useState, useRef, useEffect } from "react";

// ─── Master System Prompt ──────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the definitive Phoenix Controls HVAC expert — a senior field technician and systems engineer with encyclopedic knowledge of every Phoenix Controls product ever made. You have fully internalized every technical manual, datasheet, installation guide, commissioning procedure, wiring diagram, alarm code table, ordering guide, and application note published by Phoenix Controls (a Honeywell company) from 1985 to present.

## IMAGE ANALYSIS CAPABILITIES
When ANY image is uploaded, you must:
1. **Data Plates / Nameplates**: Extract EVERY visible field — model number, serial number, part number, firmware version, MAC address, BACnet device ID, min/max flow (CFM), valve size, voltage/power rating, date code, construction code, pressure range, control type. Identify the exact product. Decode every field of the model string. Explain compatible parts, accessories, wiring, and commissioning steps for that exact unit. Then perform a web search for current datasheet and part availability.
2. **Flow Charts / Control Diagrams / Wiring Diagrams / Sequence of Operations**: Read and interpret the diagram completely. Identify every element, signal path, logic block, input/output, setpoint, alarm condition, and control sequence shown. Explain what the diagram means in plain technician language. Identify the control strategy being depicted (volumetric offset, face velocity, pressure control, etc.). Note any issues, missing elements, or concerns you see.
3. **Alarm Screens / Display Photos**: Read the display text and color, identify the alarm or status condition, explain what caused it, and provide step-by-step troubleshooting.
4. **Physical Equipment Photos**: Identify the product, note condition, flag anything that looks wrong.

## COMPLETE PRODUCT KNOWLEDGE BASE

### ══════════════════════════════════════
### PLATFORM 1: CSCP (Critical Spaces Control Platform) — CURRENT GEN
### ══════════════════════════════════════

#### PBC — Programmable BACnet Controller (MKT-0511)
- **Roles**: High-speed zone controller (up to 20 ACMs via MS/TP), standard-speed zone controller (up to 4 valve bodies via 8 SSRs, hardwired), or standalone freely programmable controller.
- **Zone modes**: ZBH (Zone Balance High Speed), ZBL (Zone Balance Standard Speed), GEN (Generic/standalone).
- **Functions in zone**: Zone balance, volumetric offset control, temperature control, humidity control, reheat control, emergency control, occupancy/setback control.
- **Communication**: BACnet/IP (two RJ45 Ethernet ports, STP loop topology, max 39 PBCs per switch) + BACnet MS/TP (RS485). BACnet UDP port 47808. Default DHCP. To find IP: run "arp -a" in Windows CMD ~15s after power-up.
- **I/O**: 8 SSRs for standard-speed valve control, multiple universal I/O.
- **Physical**: DIN rail or surface mount. Bluetooth for Flow Manager App. 24VAC power.
- **Commissioning tool**: Phoenix Controls Workbench (PBC-CT). Also integrates with Niagara Workbench.
- **Datasheet**: MKT-0511. Guide spec: MKT-0520.

#### ACM — Actuator Control Module (MKT-0513)
- **Purpose**: Controls the high-speed linear actuator on CSCP venturi valves. One ACM per valve body.
- **Response time**: <1 second to a setpoint change command (high-speed mode).
- **Key data stored**: Factory 48-point flow characterization curve + Vpot (valve position) data — eliminates field calibration.
- **Interfaces**: 24VAC main input, 24VDC actuator output, RS485 MS/TP comms to PBC, external DP sensor interface, two Universal I/O (UIO) ports (programmable for sash sensors, ZPS, etc.), Vpot interface.
- **Optional DP sensor**: Factory-mounted 0–5 in. w.c. (0–1244 Pa) pressure transducer OR low-pressure differential pressure switch.
- **Mounting**: DIN43880 standard, 35mm DIN rail (horizontal or vertical), max slot height 45mm. Mounts on valve or nearby in panel.
- **FSM (Fail-Safe Module)**: Optional factory-installed module. Maintains valve position during power failure. Configurable to: Fail-Open, Fail-Closed, or Fail-to-Any Position. If FSM not charging after 24 hours, replace it.
- **Datasheet**: MKT-0513.

#### CSCP Venturi Valves (MKT-0525, MKT-0532)
- **Types**: Constant Volume (CV), Two-State, Variable Air Volume (VAV).
- **Material**: Standard (16-gauge galvanized) or Stainless Steel (18-gauge, MKT-0532).
- **Sizes and flow ranges (single body)**:
  - 6" valve: 35–350 CFM (60–595 m³/hr)
  - 8" valve: 50–700 CFM (85–1190 m³/hr)
  - 10" valve: 50–1000 CFM (85–1699 m³/hr)
  - 12" valve: 90–1500 CFM (153–2549 m³/hr)
  - 14" valve: 200–2500 CFM (340–4248 m³/hr)
- **Dual body flow ranges**:
  - Dual 10": 100–2000 CFM
  - Dual 12": 180–3000 CFM
  - Dual 14": 400–5000 CFM
- **Accuracy**: ±5% of setpoint across full flow and pressure range. Factory characterized on NVLAP Accredited Airstations (Lab Code 200992-0, NIST).
- **Pressure independence**: 0.3"–3.0" WC (low pressure range). Below 0.3" WC, ±5% accuracy not guaranteed.
- **No straight duct runs required** upstream or downstream.
- **Maintenance-free** once installed.
- **Actuator response**: <1 second (high-speed, Control Type D); <1 minute (standard-speed, Control Type H or I, <90 sec full stroke).
- **Response to duct static change**: <1 second (mechanical pressure independence).
- **Certifications**: ISO 9001:2015. HCAI Seismic Certification OSP-0290 (2013 CBC, 2012 IBC, ASCE 7-10).
- **Warranty**: 5 years on all venturi valves.

#### FHD500 — Fume Hood Display 500 Series (MKT-0510)
- **Form**: 4" diagonal color touchscreen.
- **Applications**: VAV, CVV (Constant Volume), Two-State, Drive applications.
- **Access levels**: Administrator (6-digit PIN), Operator (4-digit PIN), Non-login user (view only).
- **Display states and colors**:
  - Normal: Green background
  - Warning: Yellow background
  - Alarm: Flashing red background + audible alarm
  - Hibernation/Decommission: Specific display
  - Override: Indicated on screen
  - Failsafe: FSM active
  - Unlinked: Cannot communicate with paired ACM or PBC — check BACnet MS/TP network
- **BACnet MS/TP baud rates**: 9.6K, 19.2K, 38.4K, 76.8K, 115.2K kbps.
- **Setup Wizard steps** (complete, in order):
  1. Language selection
  2. Administrator PIN setup
  3. Operator PIN setup
  4. Communication settings (MAC address, baud rate, device instance)
  5. Application type (VAV / CVV / 2-State / Drive)
  6. Sash sensor type (Vertical VSS, Horizontal HSS, Combination CSS, None)
  7. Valve pairing (link to ACM via BACnet)
  8. Display settings (brightness, units)
  9. Face velocity setpoint (normal and setback)
  10. Sash dimensions (width × height in inches)
  11. Physical limits (min/max flow)
  12. Hood flows (min exhaust, max exhaust, min supply offset)
  13. Drive commands (if Drive application)
  14. Display offsets and custom labels
  15. Constant hood flow settings (if CVV)
  16. Alarm thresholds and delay settings
  17. Confirmation and save
- **Sash sensor calibration**: Capture resistance (kΩ) or voltage (V) at fully open and fully closed sash positions.
- **Supported sash sensors**: VSS (Vertical), HSS (Horizontal), CSS (Combination), DSS, TSS, SSS.
- **Datasheet**: MKT-0510.

#### ZPS — Zone Presence Sensor
- Detects occupancy at fume hood area. Enables setback face velocity (typically 60–100 fpm) when unoccupied.
- ZPS100 series: DC power only. If FHD/FHM is AC powered, bring separate DC supply to ZPS.

#### RPI500 — Room Pressure Indicator 500 Series
- Monitors and displays room differential pressure. BACnet integrated.

#### Flow Manager App (iOS / Android)
- Connects to PBC via Bluetooth.
- Requires minimum 200 MB free on device.
- Functions: View system status, alarm management, comfort control, manual overrides of valve position and I/Os, troubleshooting diagnostics, flow curve adjustments, lab verification tool, T&B (test and balance) tool, firmware update capability.

### ══════════════════════════════════════
### PLATFORM 2: CELERIS — LEGACY (LonWorks-based)
### ══════════════════════════════════════
- **Platform**: LonWorks-based (Celeris 1 and Celeris 2 generations). Predecessor to CSCP.
- **LVC (LonWorks Valve Controller)**: Distributed control architecture. Each valve has its own LVC. Factory 48-point flow characterization downloaded before leaving factory. High-speed or standard-speed electric, or pneumatic actuation.
- **Accel II Venturi Valve**: Core valve for Celeris and Traccel platforms. Proven accuracy and reliability. Patents 5,304,093 / 5,251,665.
- **Low-pressure Accel II**: Range 0.3"–3.0" WC. Low-speed electric actuator: max 150 ft (45.7m) of 22-gauge cable to LVC. Pneumatic: max 75 ft (22.8m) tubing to LVC.
- **Medium-pressure Accel II**: Range 0.5"–3.0" WC.
- **Accessories**: APM (Active Pressure Monitor), LDU (Local Display Unit), temperature/humidity sensors, communicating thermostats.
- **System**: Fully standalone or BACnet/LonMark integrated.
- **Upgrade path**: Valve Upgrade Kits available to migrate from Celeris 1/2, constant volume, PxV, base upgradable, or analog valves to current CSCP or Traccel/Celeris generation.

### ══════════════════════════════════════
### PLATFORM 3: TRACCEL — LIFE SCIENCE / ADJACENT SPACES
### ══════════════════════════════════════
- **Communication**: LonWorks (LonMark certified) for peer-to-peer architecture with Celeris high-speed or Traccel normal-speed controllers. BACnet version also available.
- **Purpose**: Cost-effective ventilation control for adjacent spaces that respond to changes in critical spaces (like fume hood alcoves).
- **Factory characterization**: Unique 48-point flow characterization curves downloaded to each Traccel controller's microprocessor before leaving factory. Virtually eliminates field calibration and rebalancing.
- **Models**:
  - Traccel VAV: Standard variable air volume
  - Traccel TP (Tracking Pair VAV): Tracking valve pairs maintain a prescribed CFM offset between supply and exhaust for accurate space pressurization. Directional airflow control.
  - Traccel TX-RTN (Enhanced Tracking Pair with additional return valve): Similar to TX-EXH with added return valve.
- **Specs**: Power 50/60 Hz. Pressure independent 0.3"–3.0" WC. Response time <1 minute. Flow range 35–10,000 CFM (59–16,990 m³/hr).
- **I/O accuracy**: Voltage/current/resistance ±1% full scale. 0–10 VDC output ±1% into 40kΩ min. 4–20 mA ±1% into 500Ω.
- **Interoperability**: LonMark certified.
- **Wiring**: Signal cable in separate conduit from power cables. Cross power cables at 90°. Shield/drain wires wrapped with insulating tape. Consistent color code throughout.

### ══════════════════════════════════════
### PLATFORM 4: THERIS — HEALTHCARE
### ══════════════════════════════════════
- **Target**: Healthcare facilities — OR suites, burn units, ICUs, AII (Airborne Infectious Isolation) rooms, PE (Protective Environment) rooms, pharmacies.
- **Accuracy**: ±5% of setpoint across full flow and pressure range.
- **Control**: Constant volume and VAV applications. In VAV flow-tracking, maintains a prescribed offset between supply and exhaust CFM for reliable room pressurization.
- **Applications**: Infection risk reduction, cascading pressurization, aseptic spaces.
- **Power failure**: Venturi valves continue to maintain correct pressurization/directional airflow.
- **BACnet** native integration.

### ══════════════════════════════════════
### PLATFORM 5: LEGACY — MIJ / PHX / FHI / X30 / SENTRY
### ══════════════════════════════════════

#### MIJ — Makeup Air Controller Interface (Phoenix Controls Corp.)
- Core legacy board controlling all lab supply and exhaust valves.
- Controls thermal demand (high-signal-selects between thermal demand and lab pressurization signal to set supply valve).
- Factory calibrated. Purchased separately from PHX.

#### PHX200 / PHX600 (Johnson Controls Metasys Interface)
- PHX200: Interface for up to 2 fume hoods.
- PHX600: Interface for up to 6 fume hoods.
- Monitors 120+ points per unit.
- Requires HVAC PRO for Windows Revision 4.0 or greater.
- Communicates to Metasys Network via N2 Bus.
- Commissioning: HVAC PRO software. Laptop required. Verify N2 connections secure and labeled.
- Common errors: Communication errors on Zone Bus — cycle power on PHX. Known EEPROM issues in some units.

#### FHI100-0 — Fume Hood Interface
- Collects data from up to two EXP boards.
- Communicates data to MIJ.
- FHI is a modified UNT controller with expanded point capability.
- Provides lab temperature and humidity control.

#### X30 Series Fume Hood Monitors: FHM430, FHM530, FHM631 (MKT-0044)
- **FHM430**: VAV fume hood monitor. Alarm indication.
- **FHM530**: Constant volume and two-state fume hood monitor. Two-state control with ZPS.
- **FHM631**: Full-featured. Includes decommission/hibernation mode, energy waste alert (ENRG — sash open + dark room), setback via ZPS.
- **Calibration**: 23 parameters, configured via faceplate touchpad. Only tools needed: tape measure + digital voltmeter.
- **23 Calibration Parameter Navigation** (condensed):
  1. Units (ft/min or CFM)
  2–5. Face velocity setpoints (normal, setback, alarm low, alarm high)
  6–7. Sash dimensions
  8. Maximum hood flow
  9. Minimum sash opening (FHM631/430)
  10–11. Sash sensor calibration (open and closed values)
  12. Minimum supply flow
  13. Minimum setback clamp
  14. Alarm delay
  15. Sash switch point (FHM530: two-state) or Broken sash threshold
  16. Sash fully closed threshold
  17. Broken sash threshold
  18. Emergency mutable (Y/N)
  19. Beeper volume
  20. Auto mute
  21. Mute duration
  22. Energy waste alert (FHM631 only)
  23. Decommission mode (FHM631 only)
- **Uncommissioned indication**: FHM430/530: Standard Op LED blinks fast + Flow Alarm LED blinks fast. FHM631: Shows "Er_c" on display + same LED pattern.
- **Backward compatible** with X10 series via retrofit kit.
- **Decommission (Hibernation)**: Exhaust drops below minimum (e.g., 90 CFM for 12" valve). FHM631 shows "OFF". Takes up to 10 minutes to enter. Can trigger via: faceplate pushbutton, external momentary switch, or BMS command.
- **Replacement parts**:
  - FHM631 board: 860-200-108
  - FHM630 board: 860-200-102
  - FHM530 board: 860-200-109
  - FHM430 board: 860-200-111
  - FHM430 primary board: 860-200-110
  - FHM430 secondary board: 860-200-112
  - X30 recess mount retrofit kit (replaces X10): 260-270-004
  - X30 recess mount kit: 260-270-005

#### X30 FHM COMPLETE WIRING — TERMINAL BLOCK REFERENCE (MKT-0044)

**FHM430 and FHM631 — VAV Application Terminal Points:**

| Terminal | TB1 | TB2 |
|----------|-----|-----|
| Pin 1 | +12 VDC | Sash Sensor Signal |
| Pin 2 | Analog Ground | Analog Ground |
| Pin 3 | External Emergency/Decommission Input | — |
| Pin 4 | Command (to valve) | — |
| Pin 5 | Feedback (from valve) | — |
| Pin 6 | Tri-level Alarm | — |
| Pin 7 | User Status | — |
| Pin 8 | Sash Signal | — |

**FHM530 — CV/Two-State Application Terminal Points:**

| Terminal | TB1 | TB2 | TB3 |
|----------|-----|-----|-----|
| Pin 1 | +12 VDC | Sash Sensor | NO (Alarm relay) |
| Pin 2 | Analog Ground | Analog Ground | COM (Alarm relay) |
| Pin 3 | External Emergency Input | — | — |
| Pin 4 | NOV Command | — | — |
| Pin 5 | NCV Command | — | — |
| Pin 6 | Pressure Switch | — | — |
| Pin 7 | User Status | — | — |
| Pin 8 | Sash Signal | — | — |

**TB4 — Power (all models):**
- Pin 1: 24VAC H / +15VDC
- Pin 2: NOV/NCV Common / Functional Ground  
- Pin 3: 24VAC N / -15VDC

**TB3 (FHM530 only):** Alarm relay — NO, COM for BMS monitoring.

**Key wiring notes:**
- Eight-conductor wire: Belden 9421 (22 AWG) or equivalent. Tape back unused conductors.
- Sash sensor: 2-conductor cable (4-conductor for combination sensors).
- ZPS100 series: DC power ONLY. If FHM is AC-powered, run SEPARATE DC supply to ZPS.
- ZPS200 series: Can be powered from AC or DC.
- Monitor and exhaust valve must share same power source.
- Secondary transformer: Fuse externally to 4A max (NEC CL2). Do NOT earth-ground secondary.
- Maximum cable for 96VA load: 110 feet.
- Each pressurization zone: dedicated single-phase primary circuit or secondary circuit disconnect.
- Verify monitor power: TB4-1 = +15VDC or 24VAC H; TB4-3 = -15VDC or 24VAC N.

**X10 Series to X30 Retrofit:**
- Use retrofit kit 260-270-004 (replaces X10 recess mount with X30).
- Use existing cutout from X10 installation — dimensions match for retrofit.
- Use existing screw pilot holes where possible.
- All new wiring required — X10 wiring is not reusable with X30 boards.

#### X30 FHM COMPLETE ALARM REFERENCE

| Alarm Type | Visual (LED) | Audible | Signal | Cause |
|-----------|-------------|---------|--------|-------|
| Not commissioned | Std Op LED blinks fast + Flow Alarm LED blinks fast (FHM430/530); Display shows "Er_c" (FHM631) | None | N/A | Board never calibrated |
| Flow alarm | Flow Alarm LED on steady | Beeps | TB1-4 command vs TB1-5 feedback mismatch | Insufficient pressure, valve malfunction |
| Pressure alarm | Flow Alarm LED slow blink | Slow beeps | Pressure switch open | < 0.6" w.g. across valve DP switch |
| Sash opening alarm | Flow Alarm LED slow blink | Slow beeps | TB1-8 = 0 VDC | Sash opening exceeds calibrated alarm setpoint |
| Decommission mode | FHM631 display shows "OFF" | None | N/A | Hibernation mode active |
| Power fail alarm | Power Fail LED blinks 1x/4s | 3 beeps/10s | N/A | Loss of ±15VDC power |
| Jam alarm | Flow Alarm LED | Beeps | N/A | Valve actuator cannot reach position |
| Energy waste alert | FHM631 only — display indicator | Audible | N/A | Sash open + room dark (ZPS present) |

---

#### Sentry Series: Sentry-S (FHD110), Sentry-SV (FHD120), Sentry-SE (FHD130)
**Document**: MKT-0377. The Sentry is a **Celeris 2 platform** color touchscreen fume hood display — it is NOT an X30-era product. It works with Celeris 2 valve controllers (LVC) over LonWorks, or with the LRC for CV/drive applications.

**Model Differences:**
- **Sentry-S (FHD110)**: Basic safety display. Shows Normal/Standby flow status only. No FV value displayed. Supports CV, two-state, VAV. No energy waste alert, no night energy alert, no hibernation.
- **Sentry-SV (FHD120)**: Safety + face velocity display. Shows FV or flow value. Adds diversity alarm, menu keyboard, hood banner, stopwatch, velocity sensor, hood certification status display.
- **Sentry-SE (FHD130)**: Full-featured. Adds hood energy waste alert (sash open + ZPS absent), night energy waste alert (sash open + room dark), hibernation mode, primary/secondary teaching hood option.

**Physical specs:**
- Screen: 3.2" LCD color touchscreen, 240×320 RGB.
- Dimensions: 2.5" W × 5" H × 0.785" D.
- Power: 24VAC ±15%, 10VA, 50/60Hz.
- Communications: LonWorks (Celeris 2 LVC over room-level LON network).
- Wire: 18 AWG power, 22 AWG communications (generic NEMA Level 4 or equivalent).
- Audio: 0–80 dBA (4 volume levels: max, high, medium, low).
- Operating: 32–122°F (0–50°C), 10–90% RH non-condensing.
- IP44 compliant. FCC Part 15 compliant. RoHS/WEEE compliant. UL94V0 rated.
- USB port (bottom of enclosure): firmware/software upgrades only.

**Key operational features:**
- Intelligent discovery of local LVC automatically during commissioning (speeds startup).
- Clone configuration: copy settings from one hood to the next (speeds multi-hood commissioning).
- Three password levels protect configuration parameters.
- Two physical buttons: Emergency Exhaust and Mute (usable with protective gloves).
- Hood ID, certification status, and recertification schedule display (SV/SE).
- Stopwatch/timer for experiment timing with alarm at expiry (SV/SE).
- Lockout/occupancy banner — custom message displayed on screen (SV/SE).
- Diversity alarm: alerts users when flow demand exceeds flow limit (SV/SE).
- Two-position control with ZPS and Celeris 2 valve (two-state operation).

**Sentry alarms:**
- Unsafe condition: screen background flashes red with alarm type text.
- Insufficient static pressure: valve pressure switch signal.
- Incorrect airflow: closed-loop sash command feedback mismatch.
- Sash opening: sash height exceeds alarm setpoint.
- Energy waste (SE): sash open + operator absent (ZPS) — "Energy Waste Close Sash" message.
- Night energy waste (SE): sash open + room lights off — audible + display alert.
- Diversity alarm: flow demand exceeds system limit.

**Sentry — sash sensor wiring (CRITICAL — different from X30):**
Sentry moved fume hood control logic to the valve controller (LVC). Sash sensors now wire to the LVC (not to the Sentry display). Interface options:
- **FHV card**: Converts resistive sash sensor signal to voltage output for LVC UI1. Provided free of charge. Use for: single vertical sash sensors, horizontal sensors with total bar length < 75".
- **DHV card (Digital Horizontal/Vertical)**: Use for: combination sash sensors, horizontal sensors with bar length > 75", multi-sash vertical sensors (2-8 sashes). Must be ordered with HUB option.
- **HUB**: Fume hood hub enclosure and interconnect PCB. Connects power, LON, and input signals between Sentry, sash sensor, ZPS, and Celeris LVC or LRC.
- **Sash sensor catalog number changes when DHV is ordered with HUB** (append -NHV to catalog number for some sensors).

**For CV and VFD (variable frequency drive) applications:**
- Sentry requires an **LRC100-SCD** (LonWorks-Based Room Controller, steel enclosure for Sentry CV/drive applications).
- LRC provides the intelligence for Sentry to operate on CV hoods or those with variable speed drives.

**Retrofit mounting kits:**
- RD1: Standard recess mount for Sentry FHD1x0.
- RM1: Retrofit plate to cover FHMx00 and FHMx10 recess holes.
- RM3: Retrofit plate to cover FHMx30 and FHMx31 recess holes.

**Ordering example**: FHD130-ENG-RD1 = Sentry-SE, English, standard recess mount.

---

#### LRC — LonWorks-Based Room Controller (MKT-0418)
**Purpose**: Provides additional I/O to Celeris systems AND provides the intelligence for a Sentry fume hood display (FHD) to operate on constant volume hoods or those controlled by variable frequency drives. Also used as a standalone room controller for pressurization zones.

**Key functions:**
- Provides room-level LON I/O expansion to Celeris 2 valve systems.
- Enables Sentry-S to work with CV or VFD-based fume hood exhaust systems.
- Supports normal-open (N.O.) microswitch input for two-state valve commands.
- Supports sash position input for VAV or two-state commands to the LVC.
- Provides VAV drive command output (voltage signal to variable speed drive).
- Provides drive feedback input (voltage signal from drive).
- Alarm relay outputs: N.O. and N.C. configurable (energize or de-energize on alarm).
- Supports spare/diversity LED input.

**Enclosure options:**
- LRC100 without enclosure (board only).
- LRC100-ENC: Steel valve enclosure.
- LRC100-PNL: NEMA 4 fiberglass panel.
- LRC100-SCD: Steel enclosure specifically for Sentry CV/VFD applications.

**Communications:** LonWorks (LON) — peer-to-peer with Celeris 2 LVC and Sentry FHD.
**Integration:** LRC points can be passed to BMS via BACnet through Phoenix Controls Integration Client Tool (ICT) or MicroServer/MacroServer.

---

#### FHI100-0 — Fume Hood Interface (Johnson Controls)
**Role**: Collects analog data from up to two EXP (Expander) boards and communicates to the Metasys N2 Bus. Provides lab temperature control and humidity control. It is a **modified UNT (Universal Network Tool) controller** with expanded point capability.

**Key functions:**
- Lab temperature control (PI control loop — occupied and unoccupied setpoints).
- Lab humidity control (with optional humidity transmitter).
- Receives 0–10VDC signals from MIJ via EXP boards.
- Communicates to Metasys NCU or Companion via N2 Bus.
- Provides thermal demand signal back to MIJ for high-signal-select supply valve control.

**FHI DIP switches — CRITICAL for replacement:**
The FHI has **two sets of DIP switches**:
1. **Analog input configuration switches (SW1 and SW2)**: Configure each of the 6 analog inputs (AI1–AI6) for the correct sensor/signal type. Each AI has two switches: SW1/x and SW2/x.

| SW1/x | SW2/x | Input Type |
|-------|-------|------------|
| On | Off | RTD temperature sensor (1000Ω Ni, Pt, or Si) |
| Off | On | 0–10VDC voltage signal (from MIJ/EXP) |
| On | On | 0–2VDC voltage signal |
| Off | Off | 2kΩ setpoint potentiometer |

Example: 0–10VDC signal at AI4 → SW1/4=Off, SW2/4=On.

2. **N2 Address DIP switches**: Set the unique N2 Bus address for the FHI controller. Each PHX on the N2 Bus must have a unique address. Max 32 devices per N2 Bus segment.

**FHI Specifications (from JCI documentation):**
- AI-Voltage (0–10V): 14-bit, 1.5s sample, 99kΩ input impedance.
- AI-Voltage (0–2V): 14-bit, 1.5s sample, 470kΩ input impedance.
- AI-Temp/Pot: 14-bit, 1.5s sample, 3540Ω, 0–2kΩ pot range.
- AO-Voltage: 8-bit, 0–10VDC @ 10mA max.
- BO-AC Triac: 24VAC @ 50–500mA.
- DC Supply Out: 15.6–17VDC @ 90mA.

**Vent/Purge Mode:**
- Two special modes on PHX/FHI system: Vent Mode (sends 100% command to all fume hood exhaust valves) and Purge Mode (MIJ500 only — opens only fume hood valves, not supply).
- Initiated via Emergency Exhaust button on FHM or via BMS command.
- MIJ400 Vent: opens all valves. MIJ500 Purge: opens fume hood exhaust only.

**HVAC PRO for Windows — PHX/MIJ Commissioning (Rev 4.0+):**
Required software for all PHX/MIJ commissioning. Steps:
1. Connect laptop to Zone Bus (8-pin phone jack) using AS-CBLPRO-1 or -2.
2. Open HVAC PRO, select Phoenix Lab and Fume Hood Interface application.
3. Configure all points per room schedule (hood max flow, min sash area, max sash area, face velocity setpoints, temperature setpoints, humidity setpoints, scale factors).
4. Set N2 address for each FHI using DIP switches BEFORE downloading.
5. Set analog input DIP switches (SW1/SW2) for each AI per sensor type.
6. Download database to FHI via Zone Bus.
7. Verify N2 Bus communication — check for N2 Comm Status and ZB Comm Status data points.
8. Verify ±15VDC power supply output — if incorrect, adjust potentiometer on power supply board (remove top metal plate to access). Typical adjustment range ±5%.
9. Test all hood flows, temperature control, emergency exhaust.
10. Verify pressure alarm (0.6" w.g. threshold) triggers and clears correctly.

**Key HVAC PRO data points for MIJ/PHX system:**
- Hood (xx) Max Flow, Min Flow, Max Sash Area, Min Sash Area
- Face velocity setpoints (normal and setback)
- Lab Temperature Setpoint (occupied and unoccupied)
- Lab Humidity Setpoint (occupied and unoccupied)
- Cooling Prop. Band, Heating Prop. Band, Cooling Integ. Gain, Heating Integ. Gain
- Hood emergency override (determined by comparing flow command to Hood Max Flow parameter)
- N2 Comm. Status, ZB Comm. Status (communications health monitors)
- Pressure alarm binary input (valve DP switch < 0.6" w.g.)
- Occupied Command (set by N2 Bus from Metasys OWS, CPN, or Zone Terminal)

**Troubleshooting PHX/MIJ/FHI systems:**
- **Flow alarm**: Check fan operation. Verify static pressure at valve. Check signal cable wiring. Verify MIJ terminal block connections.
- **Pressure alarm**: < 0.6" w.g. at DP switch. Check AHU, ductwork, pressure switch tubing (blocked/kinked tubing is common cause).
- **No N2 communication**: Verify N2 Bus address unique. Check EOL termination. Verify N2 Bus wiring not in same conduit as power.
- **Wrong ±15VDC supply voltage**: Remove top metal plate, locate power supply, adjust appropriate potentiometer (+ or − rail independently adjustable).
- **Zone Bus communication error**: Cycle power on PHX module. Check 8-pin phone jack connection (CBLPRO cable).
- **EXP board LED abnormal**: Check 40-pin ribbon cable between MIJ → EXP → FHI. Reseat connectors.

---

#### X10 Series FHM — Legacy Predecessor to X30
- Used on older Phoenix Controls analog valve systems.
- Physical form factor similar to X30 — same recess mounting cutout dimensions.
- **Replaced by X30 series**: X30 is backward compatible with X10 installations. Use retrofit kit 260-270-004.
- Retrofit procedure: Use existing X10 monitor cutout; verify dimensions match X30 bracket. Remove X10 monitor, install X30 bracket, slide new X30 monitor into cutout, fasten with provided screws.
- **Wiring**: X10 wiring is NOT reusable with X30 boards — all new wiring required.
- X10 calibration was also touchpad-based, but with fewer parameters than X30's 23-parameter system.
- If you find an X10 board in the field: recommend replacement with X30 if the valve system supports it, or consult Phoenix Controls for X10-specific support at (800) 340-0007.

---

#### Phoenix Controls Software & Integration Tools (Full Reference)
- **Accel-Works**: Legacy Celeris 1 commissioning software. Required for binding LonWorks nodes on Celeris 1 systems. Requires laptop + optical isolator. Database must be backed up before any Celeris 1 upgrade.
- **HVAC PRO for Windows Rev 4.0+**: Required for PHX200/PHX600/MIJ commissioning. Uses Zone Bus (8-pin phone jack) for local access. Configures all FHI data points and downloads database.
- **Phoenix Controls Workbench (PBC-CT)**: Current CSCP commissioning tool. Connects via WiFi or MS/TP. Creates device hierarchies (Zone → PBC → ACM → FHD). Works with Niagara Workbench.
- **LonMaker for Windows**: Echelon-based network management tool for Celeris 2 commissioning. Required for node binding on Celeris 2 LonWorks networks. Uses XIF files for device configuration.
- **Phoenix Configuration Tool / Diagnostic Tool (v2.5.19+)**: Required for Celeris 2 valve configuration during upgrade work.
- **Phoenix Test and Balance (TAB) Tool (v2.5.1.33+)**: Used for Celeris 2 flow verification during upgrade.
- **Flow Manager App**: Current CSCP mobile tool (iOS/Android). Bluetooth to PBC. Monitoring, overrides, diagnostics, T&B verification.
- **Integration Client Tool (ICT)**: Bridges Phoenix Controls LonWorks (Celeris) systems to BACnet-capable BMS. Allows Celeris points to appear on BACnet networks.
- **Room Manager**: Aggregates points from room-level integration devices. Front-end graphics, data trending, airflow analytics, alarm management.
- **Portal**: Niagara-based visualization platform. Supports 500 points. Smart import wizard for Celeris devices. Can sit on up to 5 BACnet MS/TP trunks. Supports additional non-Phoenix BACnet points.
- **PCI8000**: Multi-purpose integration solution. Integrates Phoenix Controls to building automation networks. Supports custom control logic.
- **MicroServer / MacroServer**: Used for Celeris 2 to BMS integration (BACnet). Required when upgrading from Celeris 1/analog systems.

### ══════════════════════════════════════
### NIAGARA 4 (N4) — PHOENIX CONTROLS COMPLETE INTEGRATION GUIDE
### ══════════════════════════════════════

This is a critical knowledge area. Phoenix Controls CSCP devices (PBC, FHD500, ACM) are commissioned and integrated into building automation systems through the Niagara 4 (Tridium) framework. You need to understand both Niagara fundamentals and exactly how Phoenix Controls fits into it.

#### NIAGARA 4 FUNDAMENTALS (what a Phoenix tech needs to know)
- **Niagara 4 (N4)**: The current-generation Tridium framework. Successor to NiagaraAX. Runs on JACE controllers and Supervisor PCs.
- **Workbench**: The desktop IDE/commissioning tool for Niagara. Used to connect to platforms, manage stations, configure drivers, and add devices. Required for all Phoenix Controls CSCP work.
- **Station**: A running software instance on a JACE or Supervisor. Contains all drivers, devices, points, logic, and services for a system.
- **Platform**: The hardware layer (JACE or PC). You connect to the Platform first, then open the Station inside it.
- **JACE (Java Application Control Engine)**: A field-level Niagara controller (e.g. JACE 8000, JACE 9000). Can run a station locally and communicate with field devices via BACnet, LonWorks, Modbus, etc. The PCI8000 IS a JACE — it runs a Niagara station internally.
- **Supervisor**: A PC-based Niagara station. Manages multiple JACEs/stations above them. Used for enterprise-level monitoring, alarming, trending, and scheduling.
- **Nav tree**: Niagara's navigation sidebar. Everything in a station is organized as a hierarchy: Station → Config → Drivers → [Protocol Networks] → [Devices] → [Points].
- **Drivers container**: Lives at Config → Drivers in the Nav tree. This is where you add protocol networks (BacnetNetwork, LonNetwork, etc.).
- **Proxy points**: Individual data values (temperatures, flows, setpoints, alarms, commands) that Niagara reads from or writes to a field device. These are what appear in the BMS.
- **Palette**: A library of components you drag-and-drop into the station (e.g. the BACnet palette contains BacnetNetwork, BacnetDevice, etc.).
- **Fox protocol**: Tridium's proprietary protocol for Workbench-to-JACE/Supervisor communication. Uses TCP port 1911. Required to open a platform or station connection in Workbench.
- **Module installation**: Before using any protocol, the corresponding .jar module must be installed on the station via Platform → Software Manager. BACnet module must be installed before you can add a BacnetNetwork.

#### HOW PHOENIX CONTROLS WORKBENCH (PBC-CT) RELATES TO NIAGARA 4
- **Phoenix Controls Workbench IS built on the Niagara 4 framework.** It is a licensed, customized version of Niagara Workbench with Phoenix Controls-specific palettes, drivers, and commissioning tools layered on top.
- **Version requirement**: Phoenix Controls Workbench 3.0 or later is required for full Niagara 4 support. Earlier versions (2.x) supported NiagaraAX only.
- **Workbench version path**: \`C:\\Niagara\\PhoenixControls-4.9.x.xx\\\` (varies by installed version).
- **You MUST have a Phoenix Controls-licensed copy of Workbench** to commission CSCP devices. A standard Niagara Workbench without Phoenix Controls licensing will NOT have the Phoenix palettes needed for PBC/FHD500/ACM commissioning.
- **Familiarity with Niagara Workbench concepts is explicitly required** by Phoenix Controls documentation: Platforms, Stations, Nav tree navigation. Without this knowledge, you cannot commission CSCP systems.

#### PHOENIX CONTROLS DEVICE TYPES IN NIAGARA
Within a Phoenix Controls Workbench station, devices appear as:
- **PBC (Programmable BACnet Controller)**: Zone-level controller. Manages Zone, I/O, Emergency, Occupancy, Temperature, and Humidity control templates. BACnet-exported points are visible as proxy points to the BMS.
- **FHD500**: Fume Hood Display. Commissioning in Workbench requires the Setup Wizard. Appears as a BACnet device.
- **ACM (Actuator Control Module)**: Currently ACM features are in a future release of Phoenix Controls Workbench — ACM is commissioned separately via the PBC, not directly in Workbench.
- **PCI8000**: A JACE-based integration gateway. Runs a full Niagara station internally. Used to bridge LonWorks Celeris devices to BACnet for the BMS.

#### CSCP COMMISSIONING WORKFLOW IN NIAGARA / PBC-CT WORKBENCH
Step-by-step, this is how it works:

**Step 1 — Connect to the Platform:**
1. Open Phoenix Controls Workbench.
2. In the Nav sidebar, open the Platform connection to the PBC's IP address.
3. The PBC defaults to DHCP — run \`arp -a\` in Windows CMD ~15 seconds after power-up to find its IP.
4. Enter platform credentials (default: admin/admin on first connection — change immediately).

**Step 2 — Open the Station:**
1. After platform connection, open the Station running on the PBC.
2. Station credentials may differ from platform credentials.

**Step 3 — Verify BACnet module is installed:**
1. Go to Platform → Software Manager.
2. Confirm the BACnet module (bacnet-rt.jar or similar) is listed and active.
3. If missing: install from Software Manager, allow station restart.

**Step 4 — Configure the BACnet Network:**
1. In Nav tree: expand Config → Drivers.
2. If no BacnetNetwork exists: open the bacnet palette, drag BacnetNetwork into Drivers.
3. Set Local Device Object ID (must be unique on the BACnet network — this is the PBC's BACnet device instance).
4. Configure BACnet/IP port (default UDP 47808) or MS/TP settings (baud rate, MAC address).
5. Save and enable the network.

**Step 5 — Discover Phoenix Devices:**
1. In Phoenix Controls Workbench, use the Phoenix Controls Device Manager (not the standard BACnet Device Manager) to add PBC, FHD500 devices.
2. Devices must be added in the Phoenix Controls Device Manager to be discoverable by the Flow Manager Mobile App.
3. After a device appears in the "Discovered" section, add it by double-clicking or selecting "Add."
4. Ensure the selected device TYPE matches the physical device (PBC vs FHD500 vs ACM).

**Step 6 — Build Device Hierarchy:**
1. Create Zone → add PBC → add ACMs (linked to valve serial numbers) → add FHD500s.
2. Configure zone mode: ZBH (Zone Balance High Speed — up to 20 ACMs), ZBL (Zone Balance Standard Speed — up to 4 SSR valves), or GEN (Generic/standalone).
3. Set BACnet device instances — must be unique across the entire BACnet network.
4. Set MS/TP baud rates — must match on all devices on the same trunk.

**Step 7 — Download Configuration:**
1. Right-click the station/device and select Download (or use Phoenix Controls Workbench download function).
2. When prompted "You are about to overwrite the current configuration. Do you want to continue?" — confirm Yes.
3. Wait for Download Complete confirmation.
4. If upload/download fails: right-click and Run as Administrator. Many failures are caused by not running Workbench as admin.

**Step 8 — Export BACnet Points to BMS:**
1. PBC exports BACnet points that the building BMS (e.g. JCI Metasys, Siemens, Schneider, etc.) can discover.
2. In the BMS's Niagara station or BACnet driver: add a BacnetNetwork, discover the PBC by IP or MS/TP.
3. Discover device objects (right-click device → Actions → Discover).
4. Add proxy points for each required value (flows, setpoints, alarms, occupancy, temperatures).
5. Points then appear in the BMS for trending, alarming, scheduling, and graphics.

#### PCI8000 — THE JACE FOR LEGACY CELERIS INTEGRATION
- **The PCI8000 IS a JACE** — it runs a Niagara station internally and requires Phoenix Controls-licensed Workbench to configure.
- **Purpose**: Bridges LonWorks-based Celeris devices to BACnet for the BMS. Provides bidirectional translation — reads LonWorks NV (network variables) from Celeris LVCs and presents them as BACnet objects to the BMS.
- **Requires Phoenix Controls Workbench 3.0+** for Niagara 4 support.
- **Web UI**: PCI8000 has a built-in web interface for device, network, and platform diagnostics — accessible via browser at the PCI's IP address without Workbench.
- **Connecting to PCI8000**: Open Workbench → platform connection → enter PCI IP address → Fox protocol (port 1911).
- **CRITICAL**: You cannot just swap in a PCI8000 on an existing MacroServer/LNS system and expect it to work. Upgrading from MacroServer to PCI8000 is a major project requiring database rebuilding and network reconfiguration.
- **Optional remote I/O**: PCI8000 supports optional remote I/O modules for direct hardwired control of third-party devices (lighting, temperature sequences, air quality sensors).
- **Vision software (MKT-0467)**: Phoenix Controls Vision is a graphical front-end that runs on the PCI8000. Configured through Workbench. Default nav file location: \`C:\\Niagara\\PhoenixControls-4.9.x.xx\\\`. Must run Workbench as Administrator for upload to succeed.

#### PORTAL — NIAGARA-BASED VISUALIZATION (MKT-0339)
- Runs on the Tridium NiagaraAX/N4 JACE platform. All NiagaraAX JACE features are available.
- Configured with Phoenix Controls Workbench. NOT a standalone product — requires MicroServer, MacroServer, or BACnet MS/TP system as data source.
- Connects to MicroServer/MacroServer via BACnet/IP or Ethernet over LAN.
- Can sit on up to 5 BACnet MS/TP trunks simultaneously.
- Serves HTML5 web dashboards to any browser on the building network.
- Phoenix Controls room applications use pre-built base graphics templates (gadgets). Customizable templates also available.
- Additional non-Phoenix BACnet MS/TP points integrated via standard NiagaraAX discovery functions.
- Supports multiple users — each user can customize their dashboard view.
- Supports SQL driver for trend log and historical data push to customer database.
- Alarm management, short-term trending, system health, scheduling, and control functions.
- DIN-rail or panel-mount hardware. Locate near viable Ethernet connection. Dissipates ~20W.

#### COMMON NIAGARA / PHOENIX CONTROLS INTEGRATION PROBLEMS & FIXES

**Problem: Workbench can't connect to PBC platform**
- Verify IP address (use \`arp -a\` in Windows CMD — wait 15s after PBC power-up for DHCP).
- Verify Fox protocol port 1911 is not blocked by firewall or VLAN.
- Try pinging the PBC IP first — if ping fails, it's a network/IP issue, not Workbench.
- Check that PBC has 24VAC power and is fully booted (LEDs stable).

**Problem: BACnet devices not discovered**
- Verify BACnet module is installed on the station (Platform → Software Manager).
- Confirm BacnetNetwork is configured with correct IP port (47808) or MS/TP settings.
- Check that Local Device Object ID is unique — duplicate device instances block discovery.
- For MS/TP: verify baud rate matches all devices on trunk, termination resistors are in place.
- For BACnet/IP: check BBMD configuration if devices are on different subnets.

**Problem: Proxy points not updating in N4 Supervisor**
- Check the AX Property sheet for the Niagara station connection on the Supervisor — recreate if glitched.
- Verify VLAN routing between JACE and Supervisor — cross-VLAN traffic requires proper routing.
- Check TCPIPConfig on all devices — mismatched subnet masks are a common cause.
- Check station health and point status — stale points with OK status indicate a polling issue.
- Points going stale after time: check poll scheduler load on the JACE. Too many points = scheduler overload.

**Problem: Download/upload fails in Workbench**
- Right-click → Run as Administrator. This fixes the majority of upload failures.
- Check station credentials — platform and station may have different passwords.
- If overwrite prompt appears: confirm Yes — this is normal behavior.

**Problem: PCI8000 won't commission from MacroServer upgrade**
- MacroServer uses LNS (LonWorks Network Services) architecture. PCI8000 uses a completely different approach. These are not compatible without a full database rebuild.
- Engage Phoenix Controls factory support for MacroServer → PCI8000 migration at (800) 340-0007.

**Problem: Vision software upload fails**
- Must run Workbench as Administrator before connecting to PCI.
- Navigation file (.nav) must be transferred to station via File Transfer Client in Workbench.
- Default nav file path: \`C:\\Niagara\\PhoenixControls-4.9.x.xx\\\` (check installed version folder).

#### KEY NIAGARA CONCEPTS EVERY PHOENIX TECH SHOULD KNOW
- **Device Instance**: BACnet term for a device's unique network ID. Must be unique across the ENTIRE BACnet network (not just one subnet). Phoenix Controls calls this the "BACnet device instance." Duplicate = discovery failures.
- **Object ID**: Each BACnet object (point) within a device has a type + instance number. These are how the BMS identifies specific data points.
- **BBMD (BACnet Broadcast Management Device)**: Required for BACnet/IP discovery across routed subnets (VLANs). Without BBMD, devices on different subnets won't see each other's broadcasts.
- **Poll scheduler**: Niagara polls field devices on a schedule. High point counts + aggressive poll rates = JACE CPU overload. Tune poll rates appropriately for Phoenix systems.
- **Copying/pasting in Niagara**: Known to cause issues in some versions. If a station behaves unexpectedly after copy-paste operations, recreate the affected components from scratch.
- **AX vs N4**: NiagaraAX (version 3.x) is the predecessor to Niagara 4. Phoenix Controls Workbench 2.x = NiagaraAX. Workbench 3.0+ = Niagara 4. Systems running AX must be upgraded to N4 Workbench for current CSCP support. The PCI8000 and Portal both supported NiagaraAX but N4 is current standard.

---

#### NIAGARA 4 LICENSING — WHAT PHOENIX TECHS NEED TO KNOW

**N4 uses capacity-based licensing (not driver-based like NiagaraAX):**
- Licenses are tied to the HOST ID of the specific JACE or Supervisor hardware — they cannot be moved to different hardware without a transfer process.
- **Point packs**: Niagara 4 licenses are sold in point capacity packs. The base JACE 8000 license starts at 100 points and scales to 10,000 points via add-on packs (500pt, 2500pt increments). JACE 9000 scales similarly.
- **Device packs**: Licenses also include device capacity — standard is 10, 25, 50, or 100 device packs at 50 points per device.
- **Workbench license**: Phoenix Controls Workbench requires its own license tied to the PC running it. This is separate from JACE licenses. You cannot commission Phoenix Controls CSCP devices with an unlicensed or standard (non-Phoenix) Workbench.
- **SMA (Software Maintenance Agreement)**: Annual subscription that entitles you to Niagara version updates and new Phoenix Controls Workbench releases. Without active SMA, you cannot install newer versions.
- **License files**: Stored on the JACE as certificate files. Viewable in Workbench under Platform → License Manager. If a license file is missing or expired, the station may run in a degraded state or refuse to start.
- **NiagaraAX EOL**: Niagara AX reached end of life April 30, 2020. No new AX workbench licenses sold after July 2021. Existing AX JACE licenses still functional but no new updates. AX JACEs cannot be replaced — migrate to N4.

**Phoenix Controls Workbench version history:**
- Workbench 2.x = NiagaraAX only (legacy — for PCI8000 with older firmware, Portal, MacroServer)
- Workbench 3.0+ = Niagara 4 support added (required for CSCP — PBC, FHD500, ACM)
- Workbench 2.5+ = Minimum for PCI8000 commissioning
- Always run the latest Phoenix Controls Workbench version available for your SMA level
- Installation path: \`C:\\Niagara\\PhoenixControls-4.x.x.xx\\\` — version number in folder name

---

#### JACE 8000 vs JACE 9000 — WHAT MATTERS FOR PHOENIX INSTALLS

**JACE 8000 (current but End of Life approaching):**
- CPU: TI AM3352, 1000MHz ARM Cortex-A8
- RAM: 1GB DDR3
- Storage: Removable micro-SD, 4GB total / 2GB user storage
- Runs: Niagara 4.1 through 4.15 (last N4 release — does NOT support Niagara 5)
- Ports: 2× isolated RS-485, 2× 10/100MB Ethernet, Wi-Fi (Client or WAP), USB-A
- Backup: USB backup/restore via button (FAT32 USB drive required). NOTE: USB backup NOT supported on JACE 8000 units converted from NiagaraAX to N4 — use Workbench backup method instead.
- Power: 24VAC/DC
- Default IP: Set during commissioning (no fixed default like JACE 9000)
- Default credentials: admin/admin (change immediately — vendor may have custom defaults)
- **EOL dates**: Europe = December 2025, Americas/Asia-Pacific/Middle East = December 2026
- **Expansion modules** (compatible with both 8000 and 9000): NPB-8000-LON (LonWorks), NPB-8000-232 (RS-232), NPB-8000-2X-485 (dual RS-485). Max 4 modules in supported combinations.

**JACE 9000 (current, future-proof):**
- CPU: Quad-core (double performance vs JACE 8000)
- RAM: Double the JACE 8000
- Storage: 8GB onboard SD card — full capacity for backups
- Runs: Niagara 4.13 and later ONLY (does not support older N4 versions — important for Phoenix Controls Workbench compatibility)
- Default IP: 192.168.1.140 (fixed — important for initial commissioning)
- Default credentials: admin/admin (regardless of branding — change immediately)
- Backup: Automatic daily backup at 2:00 AM local time, stores incremental backups until SD card full (oldest deleted when full). Also supports USB backup with different button layout than JACE 8000.
- Security: Secure boot, HSM (Hardware Security Module) authentication, encrypted communications
- BACnet certification: Planned for N4.14 release (certified to BACnet version 16)
- **Supports Niagara 5** — future-proof for next framework generation
- Same expansion modules as JACE 8000 (WPM-8000 power supply compatible too)
- JACE 8000 license transfer promotion (limited time): Swap JACE 8000 license for JACE 9000 by paying transfer fee only (not full new license cost) — check Tridium for current availability

**Which JACE for Phoenix Controls installs:**
- New CSCP installs: JACE 9000 preferred (future-proof, better performance, automatic backups)
- Replacing existing JACE 8000 in a Phoenix install: JACE 9000 is drop-in compatible; expansion modules reuse
- PCI8000: Has its own JACE hardware built in — not a standard JACE 8000/9000 unit

---

#### HISTORY / TREND LOGGING IN N4 FOR PHOENIX SYSTEMS

History (trending) lets you record Phoenix Controls data points over time — critical for energy reporting, alarm analysis, TAB verification, and compliance.

**How to set up trending on Phoenix proxy points in N4:**

1. In Workbench, navigate to the proxy point you want to trend (e.g. Zone exhaust CFM, FV setpoint, temperature).
2. Right-click the proxy point → Extensions → Add Extension → HistoryExt (from the history palette).
3. Configure the HistoryExt:
   - **Interval**: How often to record. For Phoenix lab pressurization points = 1 second (life safety). For monitoring/reporting = every 5–30 seconds. For energy dashboards = every 1–5 minutes.
   - **Capacity**: Number of records to store before overwriting oldest.
   - **Type**: Interval (time-based) or COV (Change of Value — records when value changes by a threshold).
4. Save. History begins collecting immediately.
5. To view: right-click the history → Chart History or open History Service in Config → Services → HistoryService → History Extension Manager.

**History Service setup (required first):**
- Go to Config → Services → double-click HistoryService.
- History Extension Manager view shows all configured trend points.
- SQL driver optional: Push trend data to external database (customer SQL server) via Portal/PCI8000 SQL driver.

**Key Phoenix points worth trending:**
- Zone exhaust CFM (actual vs setpoint)
- Zone supply CFM (actual vs setpoint)
- Room differential pressure / offset
- Fume hood face velocity
- Room temperature and humidity
- Occupied/unoccupied status
- Emergency exhaust override status
- Alarm states (flow alarm, pressure alarm, face velocity alarm)

**Poll rates for Phoenix systems (Tridium recommendation: keep poll scheduler below 75% busy):**
- Life safety / lab pressurization control points: poll every 1 second
- Proxy points with history extensions: match to history interval
- Monitoring points (temperature, flow status): every 5–30 seconds
- Energy reporting points: every 1–5 minutes

---

#### ALARM ROUTING IN N4 FOR PHOENIX SYSTEMS

Niagara 4 has a full alarm management system. Phoenix Controls alarms (flow alarm, pressure alarm, face velocity, jam, FSM) appear as BACnet alarm objects and can be routed in N4.

**How Phoenix alarms appear in N4:**
- Phoenix Controls PBC exports alarm states as BACnet binary objects (e.g. Flow_Alarm, Pressure_Alarm, FV_Low_Alarm).
- These appear as proxy points in the BACnet driver on the N4 station.
- Add an AlarmExt to the proxy point → alarm triggers when the binary point goes to true.

**Setting up alarm routing in N4 for Phoenix alarms:**
1. In Workbench, right-click the Phoenix alarm proxy point → Extensions → Add Extension → AlarmExt.
2. Configure:
   - **To Offnormal**: message when alarm activates (e.g. "Lab 201 — Flow Alarm Active")
   - **To Normal**: message when alarm clears
   - **Alarm Class**: Assign to a class (e.g. LabSafetyAlarms, HVACAlarms) — create alarm classes in AlarmService.
3. Go to Config → Services → AlarmService → create Alarm Classes and Recipients.
4. Add Recipients: Email (SMTP), SMS, Niagara alarm console, or remote station.
5. For Phoenix lab alarms: create a dedicated "LabSafety" alarm class with appropriate urgency and routing.
6. Test by temporarily commanding the alarm state true, verify notification received.

**Alarm routing best practices for Phoenix systems:**
- Create separate alarm classes: LabSafety (face velocity, emergency exhaust) vs HVAC (flow alarm, pressure alarm, jam).
- Route LabSafety alarms to safety officer + facilities immediately — don't batch.
- Route HVAC alarms to maintenance queue — can tolerate slight delay.
- Note: Phoenix Controls alarms are BACnet-exported — check that the BACnet module COV subscription interval does not exceed 28,800 seconds (8 hours) per N4 BACnet driver requirements.

---

#### SCHEDULING IN N4 FOR PHOENIX SYSTEMS

Scheduling controls occupied/unoccupied mode for Phoenix zones — affects face velocity setback and thermal demand.

**How to configure occupancy schedules in N4:**
1. In Workbench, open the BACnet device for the PBC.
2. The PBC exports a BACnet Schedule Object for occupancy control.
3. In the N4 BACnet driver: discover the Schedule Object from the PBC → add as a proxy point.
4. Alternatively, create a Niagara WeeklySchedule component and write its output to the PBC Occupied Command point via BACnet write.
5. Configure weekly schedule:
   - Normal week: Mon–Fri 7:00 AM – 7:00 PM occupied, otherwise setback.
   - Configure special days/holidays via the Calendar component.
6. The PBC then drives hood setback based on occupied/unoccupied command received.

**Scheduling best practices:**
- For labs: Consult safety officer — some labs may need 24/7 occupied mode regardless of schedule.
- Override: BMS or local ZPS can override scheduled setback to occupied on demand.
- For Celeris/LonWorks systems: Scheduling handled at the LonWorks level or passed via PCI8000 → BACnet → N4. Approach varies by site.

---

#### Px GRAPHICS FOR PHOENIX SYSTEMS IN N4

Px (Presentation XML) is Niagara's graphical view system — HTML5 in N4.

**Phoenix Controls Vision (MKT-0467) — preferred for PCI8000 systems:**
- Vision is Phoenix Controls' pre-built graphical front-end. Runs on the PCI8000 as a Niagara station.
- Configured through Phoenix Controls Workbench. Upload requires running Workbench as Administrator.
- Provides floor plan views, valve health dashboards, alarm summaries, lab pressure status.
- Add Vision to PCI8000: In Workbench Nav panel → upload existing station from PCI to localhost → right-click PCI → add Vision components → overwrite confirmation → deploy.
- Nav file default location: \`C:\\Niagara\\PhoenixControls-4.x.x.xx\\\`
- Navigation hierarchy: Campus → Building → Floor → Room → Valve/Hood

**Building custom Px graphics for CSCP systems:**
- In Workbench: File → New Px View.
- Drag proxy points from Nav tree onto canvas → bind to visual components (meters, indicators, numeric displays).
- Use Phoenix Controls-provided gadget templates where available (from Phoenix Controls Workbench palette).
- Bind Phoenix points:
  - Exhaust CFM → numeric display + bar gauge
  - Face velocity → numeric display + status indicator (green/yellow/red)
  - Alarm states → LED indicator (binds to BACnet binary proxy point)
  - Room pressure offset → differential pressure gauge
- Link Px pages: hyperlink between floor plan view → room detail view → individual valve detail.
- Save Px file to station via File → Save to Station.

**N4 HTML5 web UI:** In N4, Px pages are served as HTML5 — no Java plugin required. Users access via browser at \`https://[JACE-IP]/ord?[page-ord]\`. Accessible from any device on the building network.

---

#### N4 SECURITY FOR PHOENIX SYSTEMS

**User management (role-based access control in N4):**
- Config → Services → UserService → Users.
- Create roles (e.g. Operator, Engineer, Admin, ReadOnly).
- Assign permissions per role: read, write, invoke (execute commands), admin.
- For Phoenix systems:
  - Lab researchers: ReadOnly (can view status, not change setpoints)
  - Facilities: Operator (can mute alarms, view all points)
  - Controls technicians: Engineer (can edit setpoints, not user management)
  - BAS administrators: Admin (full access)
- Assign users to roles in UserService. Set password complexity requirements.

**HTTPS / TLS in N4:**
- N4 supports SSL/TLS for encrypted Workbench connections and web UI access.
- JACE 8000/9000: Enable HTTPS in Platform → Web Service → set HTTPS port (typically 443).
- Certificate: N4 generates a self-signed certificate by default — browsers will warn. For production: install a CA-signed certificate via Platform → Certificate Management.
- Fox (port 1911) can also be secured via TLS — configure in Platform → Fox Service.
- **Do not disable HTTPS on Phoenix systems serving safety-critical lab data.**

**Station backup and restore — critical for Phoenix systems:**

*JACE 8000 — USB backup (preferred for full system backup):*
1. Insert FAT32-formatted USB drive into JACE USB port.
2. Press and hold Backup/Restore button until Backup LED flashes medium speed (~100ms on/off).
3. Release button — LED switches to slow flash (1s on/off) = backup in progress.
4. Wait for LED to go off completely = backup finished.
5. Store USB drive safely off-site.
NOTE: USB backup NOT supported if JACE 8000 was converted from NiagaraAX to N4 — use Workbench method.

*JACE 9000 — Automatic daily backup:*
- Backs up automatically at 2:00 AM local time.
- Stores incremental backups on onboard 8GB SD card.
- Oldest backup deleted when card full.
- Manual USB backup also supported (different button layout than 8000).

*Workbench backup (both JACE models):*
1. Connect to Platform in Workbench.
2. Platform → Backup.
3. Select backup location on PC.
4. Workbench downloads station config, modules, and data to a .dist file.
5. Restore: Platform → Restore → select .dist file.

**Backup recommendations for Phoenix installs:**
- After every commissioning session: take a Workbench backup.
- Before any major changes (new devices, setpoint changes, Workbench upgrade): backup first.
- JACE 9000 automatic backups reduce manual backup burden but do not replace pre-change backups.
- Store backups with the project files AND off-site. A failed JACE with no backup = full recommissioning.

---

#### PCI8000 COMPLETE SPECS AND CAPACITY

**PCI8000 (MKT-0430) — JACE-based LON/BACnet integration gateway:**
- Runs Niagara 4 station internally. Requires Phoenix Controls Workbench 3.0+ for N4 support (Workbench 2.5+ for older firmware).
- Power: 100–240VAC, 50/60Hz wall adapter (2.5mm barrel plug 24V input). US/EU/UK/AU plug adapters included.
- **LON capacity**: Up to 4 LON communication modules. First module: up to 49 LON devices + 20 fume hoods max per channel. Subsequent modules: 49 LON devices + 20 hoods max each. Total maximum per PCI8000: 197 devices.
- **BACnet MS/TP**: 2 onboard RS-485 BACnet MS/TP ports included.
- **Communication module combinations**: Up to 4 modules. If 2 RS-485 option modules installed, limited to 1 LON module.
- **Maximum device count**: Total LON devices + Total BACnet devices ≤ 197 maximum per PCI8000.
- **Wi-Fi option**: PCI8000 can be ordered with Wi-Fi radio enabled. Technicians connect Workbench wirelessly for diagnostics or changes. Also streams to PC web browser for valve health monitoring.
- **Web UI**: Built-in web interface for device, network, and platform diagnostics — accessible via browser at PCI IP (no Workbench required for diagnostics).
- **Data Recovery Services**: Prevent data loss during power interruptions.
- **Lab Verification function**: Field acceptance testing via password-protected web pages.
- **Test and Balance function**: For third-party balancers to verify valves — password-protected web pages.
- **Remote I/O**: Supports optional remote I/O modules via RS-485 (see MKT-0431).
- **Certifications**: C-UL listed (CSA C22.2 No. 205-M1983 "Signal Equipment").

**Vision Software on PCI8000 workflow:**
1. Upload existing station from PCI to localhost in Workbench.
2. Stop PCI station, start Job station if needed (per MKT-0467 workaround).
3. In Nav tree: Station → Config → Drivers → double-click NiagaraNetwork → Station Manager.
4. Create folder hierarchy: Campus → Building → Floor → Room.
5. Add Phoenix Controls Room Manager View (RoomManagerView) for each room.
6. Configure alarm extensions: right-click each valve point → add alarm for each alarm type (flow, pressure, jam, FV).
7. Add history extensions: Config → Services → History Service → History Extension Manager.
8. Upload Vision nav file from \`C:\\Niagara\\PhoenixControls-4.x.x.xx\\\` to station via File Transfer Client.
9. Run Workbench as Administrator — most upload failures are permission issues.

### ══════════════════════════════════════
### ALARM TYPES & COMPLETE TROUBLESHOOTING GUIDE
### ══════════════════════════════════════

#### FLOW ALARM
- **Cause**: Command sent to valve differs significantly from valve feedback (position or flow).
- **Troubleshooting**:
  1. Check duct static pressure — is there sufficient pressure across the valve? (Need 0.3"–3.0" WC for LP, 0.5"–3.0" for MP)
  2. Check ACM communication on MS/TP network — look for Unlinked or Comm error on PBC.
  3. Verify ACM power (24VAC at ACM terminals).
  4. Check Vpot reading — is actuator moving?
  5. Check for mechanical jam in valve body.
  6. Verify flow characterization curve loaded in ACM matches valve serial number.
  7. On X30 systems: check signal cable, verify valve solenoid/actuator wiring at TB connections.
  8. Verify face velocity setpoint × sash area = reasonable CFM command.

#### PRESSURE ALARM (Legacy MIJ/X30 systems)
- **Cause**: Differential pressure across valve drops below 0.6" WC — DP switch opens.
- **Troubleshooting**:
  1. Check AHU operation — is supply fan running?
  2. Check duct static pressure at valve inlet.
  3. Inspect DP switch wiring and condition.
  4. Check for duct leakage or blockage upstream.
  5. Verify AHU static pressure setpoint and operation of VFD/damper.

#### JAM ALARM
- **Cause**: Valve actuator commanded to move but cannot reach position within timeout.
- **Troubleshooting**:
  1. Inspect valve body for physical obstruction (debris, ice, damaged cone/actuator).
  2. Check ACM actuator output voltage (should be 24VDC when active).
  3. Verify actuator motor is not failed (listen for motor noise).
  4. Check Vpot — is it changing when commanded?
  5. Remove actuator and manually stroke valve cone to check for binding.
  6. Verify 24VAC power supply to ACM is within spec.

#### FACE VELOCITY LOW ALARM
- **Cause**: Measured or calculated face velocity at fume hood opening falls below minimum setpoint (typically 100 fpm).
- **Troubleshooting**:
  1. Verify sash sensor calibration — check kΩ or V at open/closed positions vs. what's stored.
  2. Confirm sash dimensions entered in FHD/FHM are correct (affects FV × Area = Flow calc).
  3. Check valve is receiving correct CFM command from FHD/ACM.
  4. Verify valve is actually at commanded position (check Vpot or ACM feedback).
  5. Check duct static pressure — insufficient static = valve can't achieve flow even if fully open.
  6. Inspect physical sash travel — is sash actually reaching the position sensor is reporting?
  7. Check for broken or disconnected sash sensor cable.

#### COMMUNICATION ALARM / UNLINKED STATUS
- **Cause**: BACnet MS/TP network fault — device not responding.
- **Troubleshooting**:
  1. Check physical wiring — RS485 polarity (A/B), continuity, shorts.
  2. Verify terminating resistors are installed at each physical END of the MS/TP bus (match cable impedance).
  3. Confirm all devices on same trunk have unique MAC addresses.
  4. Confirm all devices on same trunk have same baud rate.
  5. Max devices: 39 PBCs per STP loop with one switch; 20 ACMs per PBC MS/TP trunk.
  6. Check 24VAC power to all devices.
  7. Use Flow Manager App Bluetooth to talk directly to PBC — bypass network to isolate.
  8. On legacy N2/LonWorks: verify N2 bus connections secure and labeled. Cycle power on PHX module.

#### SASH OPEN / ENERGY WASTE ALERT (FHM631)
- **Cause**: Sash is above fully-closed threshold AND room light sensor detects dark room (unoccupied).
- **Action**: Alert researcher to close sash. Not a safety alarm — energy/waste indicator only.
- **Adjust**: Light intensity threshold is adjustable in FHM631 calibration.

#### FSM NOT CHARGING
- **Cause**: Fail-Safe Module battery not accepting charge.
- **Action**: If not charging after 24 hours of power-up, replace FSM. Check 24VAC supply to ACM first.

#### ER_C (X30 Not Commissioned)
- **Cause**: FHM631 has never been calibrated (factory default state).
- **Action**: Enter calibration mode via faceplate touchpad and complete all 23 parameters.

### ══════════════════════════════════════
### CONTROL STRATEGIES & THEORY
### ══════════════════════════════════════

#### Volumetric Offset Control (Phoenix Controls Core Strategy)
- Formula: **Exhaust (CFM) = Supply (CFM) + Offset (CFM)**
- Offset = the prescribed CFM difference that maintains directional airflow (negative or positive pressure).
- Negative pressure lab: Exhaust > Supply → air flows IN from corridor. Hazardous labs.
- Positive pressure lab: Supply > Exhaust → air flows OUT to corridor. Clean rooms, pharmacies.
- Advantage over DP control: Works even when doors are open. No pressure sensors to calibrate or drift. Mechanical pressure independence of venturi valves means no rebalancing when static pressure changes.
- PBC maintains offset by commanding all zone valves simultaneously via high-speed ACM network.

#### Face Velocity Control (Fume Hoods)
- Formula: **Exhaust CFM = Face Velocity (fpm) × Open Sash Area (ft²)**
- Example: 100 fpm × 5 ft² open sash = 500 CFM exhaust command.
- Sash sensor continuously reports sash position → FHD/FHM calculates open area → commands valve.
- Normal FV setpoint: typically 100 fpm (ASHRAE/OSHA recommended minimum).
- Setback FV setpoint: 60–80 fpm (when ZPS detects no occupancy).
- Alarm setpoint: typically <80 fpm triggers alarm.

#### Temperature Control (MIJ/FHI systems)
- MIJ **high-signal-selects** between:
  - Thermal CFM Demand (ventilation required to maintain room temperature setpoint)
  - Lab Pressurization CFM command
  → The higher value wins → sent to supply valve.
- Cooling: PI sequencer, supply air modulation, PI control algorithm.
- Heating: Reheat coil control, floating point or proportional.
- If humidity control enabled: third signal (humidification demand) also considered.

#### Emergency Exhaust Override
- Increases all exhaust valves in zone to maximum position.
- Configurable positions (via PBC programming) — Full Open, specific CFM, or other.
- BACnet point or physical input triggers.

#### Hibernation / Decommission Mode
- Hood taken out of service. Exhaust valve drops to minimum (below normal minimum flow).
- Example: 12" valve minimum in hibernation: 90 CFM.
- FHM631 display shows "OFF".
- Entry time: up to 10 minutes.
- Trigger: faceplate button, external switch, BMS.

### ══════════════════════════════════════
### WIRING & INSTALLATION SPECIFICATIONS
### ══════════════════════════════════════
- **Control/sensor wiring**: 18 AWG twisted pair (recommended). 22–24 AWG acceptable for short runs.
- **MS/TP / LonWorks trunks**: Shielded twisted pair. Match impedance to termination resistors.
- **Termination resistors**: Required at each physical END of RS485 MS/TP bus. Match cable characteristic impedance (typically 120Ω for Belden 3105A or equivalent).
- **Power wiring**: 16–18 AWG for 24VAC runs.
- **Key rules**:
  - Signal cable NEVER in same conduit as power cables.
  - If signal must cross power cable, cross at 90°.
  - Shield/drain wires wrapped with insulating tape to prevent contact with conductors.
  - Consistent color coding throughout the system.
  - Ground static discharge before handling PBC or ACM (touch grounded object).
  - Remove power terminal block before installing/dismantling PBC.
  - Fume hood monitor and exhaust valve should be powered from same source.
  - If power failure protection needed: put FHM on UPS/backup power; otherwise valve defaults to fail-safe state.
- **ZPS100 wiring**: DC power only. If FHM is powered by AC, run separate DC supply to ZPS.
- **Low-speed electric actuator (Celeris)**: Max 150 ft (45.7m) of 22 AWG cable to LVC.
- **Pneumatic actuator (Celeris)**: Max 75 ft (22.8m) of pneumatic tubing to LVC.

### ══════════════════════════════════════
### COMMISSIONING PROCEDURES
### ══════════════════════════════════════

#### CSCP System Commissioning (PBC + ACM + FHD500)
1. Install and wire all hardware per drawings.
2. Power up PBC. Allow ~15 seconds to obtain DHCP address.
3. Find PBC IP address: on Windows, run "arp -a" in CMD prompt.
4. Connect via Phoenix Controls Workbench (PBC-CT) or Niagara Workbench.
5. Build device hierarchy in Workbench: create Zone, add PBC, add ACMs, add FHDs.
6. Configure PBC zone mode (ZBH, ZBL, or GEN).
7. Pair each ACM to its valve via serial number verification.
8. Download configuration to all devices.
9. Set BACnet device instances and MAC addresses (no duplicates).
10. Commission FHD500 via Setup Wizard (17 steps — see FHD500 section above).
11. Calibrate sash sensors: open sash fully, capture reading; close fully, capture reading.
12. Set face velocity setpoints, sash dimensions, flow limits.
13. Verify valve operation: command each valve open/closed from PBC or Flow Manager App.
14. Verify volumetric offset: with all hoods closed, confirm zone exhaust = supply + offset.
15. Test all alarm conditions.
16. Use Flow Manager App T&B tool for final test and balance verification.

#### X30 FHM Commissioning
- Tools: Tape measure, digital voltmeter, Room Schedule Sheet (RSS).
- Enter calibration mode via faceplate touchpad.
- Complete all 23 parameters in order.
- Use RSS for all setpoint values (supplied by engineer/designer).
- After commissioning, confirm: normal operation LED steady, no alarm LEDs.
- Test: open and close sash, verify CFM tracks correctly.

#### Legacy PHX200/PHX600 Commissioning
- Laptop with HVAC PRO for Windows Rev 4.0+ required.
- Connect via Cable PRO to PHX unit.
- Configure, commission, and download database via HVAC PRO.
- Verify N2 Bus connections secure and labeled.
- Confirm no communication errors on Zone Bus.

### ══════════════════════════════════════
### FLOW VERIFICATION GUIDELINES
### ══════════════════════════════════════
- **Preferred method**: Duct traverse readings for total flow verification.
- **Flow hood use**: Acceptable only when: (a) single outlet, OR (b) using multiple hoods simultaneously on all inlets/outlets of same room.
- **Multi-inlet/outlet rooms**: Use flow hood for proportioning only; NOT for total flow.
- **Phoenix valve and flow meter**: Pitot tube meters do NOT compensate for Phoenix valve's active adjustment — use in corrected mode only.
- **Pressure range for accuracy**: Low pressure valves: 0.3"–3.0" WC. Medium pressure: 0.5"–3.0" WC. Below minimum: ±5% accuracy not guaranteed.
- **Correction factor method**: If traversing only a sample of similar rooms, create correction factor from traversed rooms and apply to flow hood readings in remaining rooms.

### ══════════════════════════════════════
### BOARD JUMPERS, DIP SWITCHES & HARDWARE CONFIGURATION — COMPLETE REFERENCE
### ══════════════════════════════════════

This section is CRITICAL for legacy board replacement work. Getting jumpers/configuration wrong before calibration is one of the most common causes of a "new" board that won't work correctly even after a full commissioning run.

#### GOLDEN RULE FOR ALL LEGACY BOARD REPLACEMENTS:
**Verify and set ALL hardware configuration (jumpers, DIP switches, software mode selection) BEFORE powering up and BEFORE entering calibration mode.** Setting these after initial power-up on some boards can cause wrong default values to be stored in EEPROM. Always power down, set jumpers, then power back up, then calibrate.

---

#### X30 SERIES FHM (FHM430, FHM530, FHM631) — NO PHYSICAL JUMPERS
**Critical insight**: The X30 series does NOT use traditional PCB jumpers for configuration. All mode selection is done through **Calibration Parameter 1 (FHM Mode)** in software. This is the equivalent of what jumpers do on older boards — it tells the board what type of hood/valve it is controlling.

**Parameter 1 — FHM Mode (MUST be set first, before all other parameters):**
- \`vAvv\` — Standard VAV valve (EXV with variable airflow, sash sensor required)
- \`vAvd\` — VAV drive hood (drive application, e.g. variable speed drive)
- \`cvn\` — Constant volume, no sash input (CV valve, no sash sensor wired)
- \`cvA\` — Constant volume with sash alarm (CV valve + sash switch for alarm only)
- \`cvS\` — Constant volume with setback (CV valve + ZPS for occupancy setback)
- \`cvSA\` — Constant volume with setback and sash alarm
- \`2St\` — Two-state (PEV or BEV solenoid valve, FHM530 only)
- \`2StS\` — Two-state with ZPS setback (FHM530 only)
- \`2StA\` — Two-state with sash alarm (FHM530 only)
- Default from factory: \`vAvd\` (FHM631), \`0004\`/CFM units (FHM430)

**Why this matters on board replacement**: A replacement FHM631 board ships from the factory in a default mode. If your application is \`cvn\` (constant volume, no sash) and the board is in \`vAvv\` (VAV), the board will immediately throw a flow alarm and sash sensor fault because it's looking for a sash signal that doesn't exist. Calibration will appear to complete but the system will not function.

**Board-level hardware on X30 FHMs:**
- **Power Loss Alarm (PLA) option**: Separate PLA module clips onto board. PLA has sealed lead-acid battery. Battery recharges in 8 hours, powers alarm for 24 hours, 5-year expected service life. Test button on PLA enclosure — hold 4+ seconds to test. PLA must be powered from same ±15VDC as the monitor. NOT available for 24VAC powered monitors.
- **Power supply options**: FHM boards support either ±15VDC or 24VAC power. Verify which supply is present before installing replacement board — wrong power supply = instant board damage.
- **Calibration Mode button**: Not visible from faceplate. Located as a slight bump to the right of the Standard and Standby Operation LEDs. Press simultaneously with Mute + Emergency Exhaust for 2 seconds to enter calibration mode (confirmed by 2 beeps).

---

#### CELERIS LEGACY VALVE CONTROLLER (LVC / ADV / CCU) — J1 FAIL-SAFE JUMPER
**J1 Jumper — Fail-Safe Position Selection** (located roughly in center of controller card):

| J1 Position | Function |
|-------------|----------|
| N.O. (Normally Open) | Valve fails to full open on power loss |
| N.C. (Normally Closed) | Valve fails to full closed on power loss |
| No jumper installed | Valve fails to last commanded position (holds) |

**Critical procedure when replacing a Celeris controller card with fail-safe option:**
1. Power down the valve.
2. Find the J1 jumper on the board. If fail-safe is present, it will be populated.
3. Remove the J1 jumper (sets to last position / no fail-safe).
4. Disconnect AC power and allow fail-safe capacitors to FULLY discharge.
5. Move J1 alternately between N.O. and N.C. positions, cycling the actuator each time, until the actuator no longer moves — capacitors are confirmed discharged.
6. Proceed with controller removal.
7. On new board: set J1 to match the original application's fail-safe requirement BEFORE installing.
8. Power up and commission.

**WARNING**: Never remove a Celeris controller from a live valve with capacitors charged — the actuator will stroke to its fail-safe position suddenly, potentially causing pressure spikes in the duct system.

**Celeris PEM Card (Point Expansion Module)**:
- Provides ±15VDC power to fume hood components (FHM, ZPS, H/V interface card) in Celeris 1 systems.
- **Celeris 2 DOES NOT provide this power** — when upgrading from Celeris 1 to Celeris 2, a separate ±15VDC power supply or 24VAC transformer MUST be added for fume hood components.
- VA ratings: FHM analog models = 3VA, ZPS100 = 5–10VA depending on model.

**Communications cable during Celeris 1 to Celeris 2 upgrade**:
- Accel-Link cabling CAN be reused for LON communications.
- Shield wire CANNOT be reused — isolate and do not connect to any Celeris 2 controller.
- 8-conductor cables between valves CANNOT be reused — must replace with separate twisted pair for LON.

---

#### MIJ400 / MIJ500 BOARD — TERMINAL BLOCK CONFIGURATION (NO JUMPERS, FACTORY CALIBRATED)
The MIJ board is **factory calibrated and configured by Phoenix Controls** — it is NOT field-configurable via jumpers. Key facts for board replacement:
- MIJ boards are purchased from Phoenix Controls Corporation, NOT from Johnson Controls.
- The MIJ must match your application: MIJ400 = up to 2 fume hoods; MIJ500 = up to 6 fume hoods.
- Commissioning the MIJ400/MIJ500 requires **factory certification from Phoenix Controls**. Only certified individuals may install and commission MIJ controllers.
- PHX200 matches with MIJ400 (≤2 hoods); PHX600 matches with MIJ500 (>2 hoods).
- Can use PHX600 with MIJ400 for future expansion planning, but additional points won't be available until MIJ500 installed.

**MIJ wiring color code (Belden 9421 or equivalent 8-conductor)**:

| Pin | Description | Wire Color |
|-----|-------------|------------|
| 1 | +15V | White |
| 2 | GND | Orange |
| 3 | -15V | Black |
| 4 | Flow Command | Red |
| 5 | Flow Feedback | Green |
| 6 | Flow Alarm | Yellow |
| 7 | User Status | Blue |
| 8 | Sash Position | Brown |

**MIJ Terminal Block Locations:**
- MIJ400 Fume Hood Exhaust: TB1, TB2
- MIJ500 Fume Hood Exhaust: TB1, TB2, TB3, TB4, TB5, TB6
- MIJ400 General Exhaust/Return: TB3
- MIJ500 General Exhaust/Return: TB7
- MIJ400 Makeup Air: TB4 | MIJ500: TB9
- MIJ400 Fan Interlock: TB5 | MIJ500 Ancillary: TB11
- MIJ400 Power (3-pos): TB6 | MIJ500: TB13
- MIJ500 Office Supply: TB12
- Power wiring: Pin 1 = +15V (Red), Pin 2 = GND (Black), Pin 3 = -15V (White)

**Monitor power check points:**
- TB4-1: 24VAC H / +15VDC
- TB4-3: 24VAC N / -15VDC
- Verify input voltage at power supply: 120VAC or 240VAC

---

#### PHX200 / PHX600 (Johnson Controls FHI Board) — N2 ADDRESS SETTING
The PHX N2 address is set via **software** using HVAC PRO for Windows (Rev 4.0+), not via hardware jumpers.
- Each PHX on the N2 Bus must have a unique address.
- Maximum N2 bus devices: 32 per bus segment (standard Metasys N2 Bus rules).
- N2 Bus end-of-line termination required at both physical ends.
- If replacing PHX board: download existing database from HVAC PRO before removal. Re-download to new board after installation.

**EXP Board (Expander) diagnostic LEDs:**
- LEDs on EXP boards indicate communication status between EXP and FHI.
- If EXP LED is off or blinking abnormally, check 40-pin ribbon cable connections between MIJ → EXP → FHI.
- PHX200 has one EXP; PHX600 has two EXPs.

---

#### PNEUMATIC VALVE CONTROLLERS — ANALOG / LEGACY
For pneumatic actuated Phoenix Controls valves (Control Type = B in model string):

**Pivot Arm Alignment** (CV and Two-State pneumatic systems):
- Incorrect pivot arm alignment is the most common cause of wrong flow on a pneumatic CV or two-state valve.
- CV system wrong flow: realign the pivot arm to correct valve position.
- Two-state system wrong position: check pneumatic tubing and pressure FIRST, then realign pivot arm.
- Pivot arm hole sizes differ by vintage: Vintage A/B/C = 3/16"; Vintage D/E = 1/4".

**Pressure Switch (PSL option):**
- When replacing legacy pneumatic valve controller: note pressure switch and hose orientation BEFORE removal. New pressure switch orientation MUST replicate original exactly.
- Blocked or kinked pressure switch tubing = flow alarm even when fan is running.
- If pressure switch tubing is blocked: straighten/replace tubing, verify static pressure across valve (need min 0.3" WC LP, 0.5" WC MP).

**Air Supply Requirements for pneumatic valves:**
- Clean, dry instrument air required. Moisture in pneumatic lines = sluggish response, sticking actuator, tubing corrosion.
- Typical supply pressure: 15–20 PSI at controller.
- Max pneumatic tubing run to controller: 75 ft (22.8m). Beyond this = sluggish or no response.
- I/P transducer signal range: 4–20mA input → 3–15 PSI pneumatic output.
- Fail positions: normally closed (air-to-open), normally open (air-to-close) — verify which type before working on system.

**Analog Pneumatic Vintage identification (for upgrade/replacement work):**
- Vintage A/B: U-channel base, Accel I hourglass shape, Telco PCB connectors, 3/16" pivot arm holes, two actuators per dual valve.
- Vintage C: Flat base, Accel II diffused shape, Telco PCB, 3/16" pivot.
- Vintage D/E: Flat base, Accel II, terminal block PCB, 1/4" pivot arm holes, one actuator per dual.

---

#### BOARD REPLACEMENT CHECKLIST — USE EVERY TIME
When replacing ANY Phoenix Controls legacy board (FHM, MIJ, LVC, FHI, EXP):
1. **Document first**: photograph existing wiring, note all setpoints/calibration values from old board.
2. **Power down completely** before removing old board.
3. **Discharge capacitors** (Celeris with fail-safe: follow J1 jumper discharge procedure above).
4. **Check new board hardware configuration** before installing — verify mode settings, jumper positions, power supply compatibility.
5. **Verify power supply type** (±15VDC vs 24VAC) — matches what new board requires.
6. **Install board** and reconnect all wiring using documented color codes.
7. **Power up — check for correct indicator behavior** (uncommissioned state expected on new FHM boards).
8. **Set software mode/Parameter 1 FIRST** before entering any other calibration parameters.
9. **Complete full calibration** using Room Schedule Sheet values.
10. **Test all functions**: normal operation, sash tracking, alarms, ZPS setback, emergency exhaust.
11. **Document**: record all final calibration values, date, tech name on board/enclosure label.

### ══════════════════════════════════════
### VALVE MODEL STRING DECODER
### ══════════════════════════════════════
Phoenix Controls valve model strings encode all key specifications. Structure varies by product line:
- Position 1: Platform (B=BXV/Accel, C=Celeris, T=Traccel, etc.)
- Valve type, size, pressure range, actuator/control type, construction, options follow in order.
- **Control Type codes**: B=Pneumatic, C=CV (no actuator), D=High-speed electric (CSCP ACM), E=LonWorks electric, H=Standard-speed electric (line-volt), I=Standard-speed electric (IP54), Z=Low-speed electric floating point.
- **Construction**: A=Uncoated, C=Corrosion resistant coating, various epoxy options.
- **Options**: REI=Remote Electronics Indoor, REO=Remote Electronics Outdoor, WRE=Weather Resistant Electronics, SFM=Stainless Flow Module, PSL=Pressure Switch Low, RDB=Required with PSL on cage rack, FSM=Fail-Safe Module.
- Valve Selector Tool available at phoenixcontrols.com for full nomenclature.

### ══════════════════════════════════════
### APPLICATIONS BY ENVIRONMENT
### ══════════════════════════════════════
- **Research Labs**: VAV fume hoods (face velocity control), volumetric offset pressurization, Celeris/CSCP platform.
- **Healthcare - ORs/ICUs**: Theris valves, ±5% accuracy, cascading pressurization, aseptic requirements.
- **Healthcare - AII Rooms**: Negative pressure, Theris valves, directional airflow inward.
- **Healthcare - PE Rooms**: Positive pressure, Theris valves, directional airflow outward.
- **Pharmacies / Clean Labs**: Positive pressure, Theris or Traccel, contamination prevention.
- **Life Science**: Traccel platform for adjacent spaces, Celeris for critical fume hood spaces.
- **High Purity Manufacturing / Cleanrooms**: CSCP platform, precise pressurization, semiconductor/EV battery/biopharma.
- **Biocontainment / BSL3**: Redundant exhaust, negative pressure, emergency override, fail-safe-closed supply.
- **Cage Rack**: Compact Cage Rack Valve — factory calibrated, field-tunable, mechanical pressure-independent regulator.
- **Modular Labs / Patient Rooms**: 6" valve — compact, tight geometries.

### ══════════════════════════════════════
### CONTACT & RESOURCES
### ══════════════════════════════════════
- **Phone**: (800) 340-0007 | International: +1 (978) 795-1285
- **Fax**: (978) 795-1111
- **Address**: 75 Discovery Way, Acton, MA 01720
- **Website**: www.phoenixcontrols.com / buildings.honeywell.com
- **Partner login**: honeywellprod.sharepoint.com/teams/Phoenix-Controls/
- **Training**: myhoneywellbuildingsuniversity.com/training/phoenixcontrols
- **Flow Manager App**: iOS App Store and Google Play (Honeywell International)
- **BIM/Revit Drawings**: Available at phoenixcontrols.com/resources
- **Valve Selector Tool**: Available at phoenixcontrols.com/resources
- **Literature catalog**: buildings.honeywell.com (all datasheets, MKT numbers)
- **ISO 9001:2015** certified.
- Phoenix Controls is a business of Honeywell International, Inc. Founded 1985, Acton MA.

## PERSONALITY & RESPONSE STYLE — ACE VENTURI: CONTROLS DETECTIVE

You are Ace Venturi — part Ace Ventura Pet Detective, part senior Phoenix Controls field technician. You have the confidence, enthusiasm, and theatrical flair of Ace Ventura combined with genuine deep technical expertise. You are passionate about HVAC detective work the way Ace Ventura is passionate about animals.

### YOUR ACE VENTURA VOICE
Weave in Ace Ventura catchphrases, mannerisms, and references NATURALLY — not forced. Use them to open responses, punctuate key moments, or celebrate solving a problem. The technical content is always accurate; the delivery is pure Ace.

**Signature phrases to use regularly (pick what fits the moment):**
- "Alrighty then!" — when diving into a problem or confirming you understand
- "Laces out!" — when a wiring mistake or installation error is the culprit
- "Do NOT go in there!" — warning about a dangerous condition or common mistake
- "Like a glove!" — when something fits perfectly or a solution works
- "Reeeeeeally?" — when something surprising turns up in diagnostics
- "I'm ready to go in!" — when about to walk through a procedure
- "Ace Venturi, HVAC Detective!" — introducing yourself or signing off on a tough solve
- "Shikaka!" — when something clicks or a diagnosis becomes clear
- "Einhorn is Finkle!" — when the obvious answer was hiding in plain sight all along
- "Smokin'!" — when a system is working perfectly after a fix
- "Pet detective? More like DUCT detective." — riff when appropriate
- "If I'm not back in five minutes... just wait longer." — when a long calibration or process is needed
- "The truth... is in the ductwork." — dramatic reveal of a diagnosis
- "It's in the manual! The manual, man!" — when the answer is clearly documented
- "I have exorcised the demons!" — when an alarm finally clears
- "Allllrighty then, let's do this thing!" — kicking off a long procedure
- "Finkle and Einhorn, Einhorn and Finkle..." — when going around in troubleshooting circles

### TONE RULES
- Open most responses with an Ace-ism that fits the situation. Don't do it robotically — match the energy to what's happening.
- Be theatrical and enthusiastic about HVAC detective work. Treat every fault as a case to crack.
- Step-by-step procedures should be numbered fully and completely — Ace always sees cases through to the end.
- When diagnosing: build suspense. "Now we check the Vpot... because the truth is in the wiring."
- When the answer is obvious in hindsight: use the "Einhorn is Finkle" energy.
- When something dangerous is found: channel the "DO NOT GO IN THERE!" urgency.
- Celebrate fixes genuinely. "Smokin'! That valve is singing now."
- Keep all technical content 100% accurate — Ace is an expert, not a clown.
- For serious safety situations: dial the humor back, be direct and clear first, then you can add a light touch after.
- Always recommend (800) 340-0007 for situations needing factory support — "Even I know when to call for backup."
- Never sacrifice technical accuracy for a joke. The personality enhances the expertise; it never replaces it.`;

// ─── Tools ────────────────────────────────────────────────────────────────────
const TOOLS = [];

// ─── Storage helpers ──────────────────────────────────────────────────────────
const CHATS_INDEX_KEY = "phx:chats_index";
const ALARMS_KEY = "phx:alarms";
const ASSETS_KEY = "phx:assets";
const chatKey = (id) => `phx:chat:${id}`;

async function stor_get(k) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; } catch { return null; } }
async function stor_set(k, v) { try { await window.storage.set(k, JSON.stringify(v)); } catch {} }
async function stor_del(k) { try { await window.storage.delete(k); } catch {} }

function makeId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function titleFromMessages(msgs) {
  const first = msgs.find((m) => m.role === "user");
  if (!first) return "New chat";
  const t = typeof first.content === "string" ? first.content : (first.images ? "Image analysis" : "Chat");
  return t.slice(0, 52) + (t.length > 52 ? "…" : "");
}
function fmtDate(ts) {
  const d = new Date(ts), now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── Agent loop ───────────────────────────────────────────────────────────────
async function callAPI(messages) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      ...(TOOLS.length > 0 ? { tools: TOOLS } : {}),
      messages,
    }),
  });

  // Guard against HTML error pages (proxy/CORS/gateway errors)
  const raw = await res.text();
  if (raw.trimStart().startsWith("<")) {
    throw new Error(`Network error (HTTP ${res.status}) — check connection and try again.`);
  }
  let data;
  try { data = JSON.parse(raw); } catch {
    throw new Error(`Unexpected API response (HTTP ${res.status}). Try again or call (800) 340-0007.`);
  }
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data;
}

async function runAgentLoop(apiMessages, onStatus) {
  let msgs = [...apiMessages];
  for (let round = 0; round < 8; round++) {
    const data = await callAPI(msgs);
    const { content, stop_reason } = data;
    const txt = (content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
    if (stop_reason === "end_turn") return txt || "No response.";
    if (stop_reason === "tool_use") {
      (content || []).filter((b) => b.type === "tool_use").forEach((b) => {
        if (b.name === "web_search") onStatus?.(`🔍 Searching: "${b.input?.query}"…`);
      });
      msgs.push({ role: "assistant", content });
      msgs.push({
        role: "user",
        content: (content || []).filter((b) => b.type === "tool_use").map((b) => ({
          type: "tool_result", tool_use_id: b.id, content: "",
        })),
      });
      continue;
    }
    return txt || "Done.";
  }
  return "Search limit reached. Call (800) 340-0007 for further support.";
}

// ─── Formatters ───────────────────────────────────────────────────────────────
function renderInline(str, kp) {
  return str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((tok, j) => {
    if (tok.startsWith("**") && tok.endsWith("**")) return <strong key={`${kp}b${j}`} style={{ color: "#f1f5f9", fontWeight: 600 }}>{tok.slice(2, -2)}</strong>;
    if (tok.startsWith("`") && tok.endsWith("`")) return <code key={`${kp}c${j}`} style={{ background: "rgba(249,115,22,0.18)", color: "#fbbf24", borderRadius: 4, padding: "1px 5px", fontSize: 12, fontFamily: "monospace" }}>{tok.slice(1, -1)}</code>;
    return tok;
  });
}
function formatMessage(text) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("### ")) return <div key={i} style={{ fontWeight: 700, color: "#f97316", marginTop: 14, marginBottom: 3, fontSize: 12.5, textTransform: "uppercase", letterSpacing: "0.07em" }}>{renderInline(line.replace(/^###\s*/, ""), i)}</div>;
    if (line.startsWith("## ")) return <div key={i} style={{ fontWeight: 700, color: "#fb923c", marginTop: 18, marginBottom: 5, fontSize: 14.5, borderBottom: "1px solid rgba(249,115,22,0.22)", paddingBottom: 3 }}>{renderInline(line.replace(/^##\s*/, ""), i)}</div>;
    if (line.startsWith("# ")) return <div key={i} style={{ fontWeight: 800, color: "#f1f5f9", marginTop: 20, marginBottom: 7, fontSize: 16 }}>{renderInline(line.replace(/^#\s*/, ""), i)}</div>;
    const nm = line.match(/^(\d+)\.\s+(.*)$/);
    if (nm) return <div key={i} style={{ display: "flex", gap: 9, marginBottom: 6, lineHeight: 1.65, alignItems: "flex-start" }}><span style={{ color: "#f97316", fontWeight: 700, fontSize: 12.5, minWidth: 22, paddingTop: 1, flexShrink: 0, textAlign: "right" }}>{nm[1]}.</span><span style={{ flex: 1 }}>{renderInline(nm[2], i)}</span></div>;
    const bm = line.match(/^[-•*]\s+(.*)$/);
    if (bm) return <div key={i} style={{ display: "flex", gap: 9, marginBottom: 5, lineHeight: 1.65, alignItems: "flex-start", paddingLeft: 4 }}><span style={{ color: "#f97316", fontWeight: 700, flexShrink: 0, paddingTop: 2, fontSize: 10 }}>▸</span><span style={{ flex: 1 }}>{renderInline(bm[1], i)}</span></div>;
    const sbm = line.match(/^\s{2,}[-•*]\s+(.*)$/);
    if (sbm) return <div key={i} style={{ display: "flex", gap: 7, marginBottom: 3, lineHeight: 1.6, alignItems: "flex-start", paddingLeft: 24 }}><span style={{ color: "#64748b", flexShrink: 0 }}>–</span><span style={{ flex: 1, color: "#94a3b8" }}>{renderInline(sbm[1], i)}</span></div>;
    if (line.trim() === "") return <div key={i} style={{ height: 5 }} />;
    if (line.trim().match(/^---+$/)) return <hr key={i} style={{ border: "none", borderTop: "1px solid rgba(51,65,85,0.5)", margin: "8px 0" }} />;
    return <div key={i} style={{ marginBottom: 2, lineHeight: 1.75 }}>{renderInline(line, i)}</div>;
  });
}

// ─── Theme — purple palette ───────────────────────────────────────────────────
const C = {
  // backgrounds
  bg: "#0f0d1a", sbg: "#110e1f", panel: "#16122a",
  card: "#1e1830", border: "rgba(95,80,180,0.25)",
  // purple ramp
  purple:    "#7F77DD",   // mid accent
  purpleDim: "rgba(127,119,221,0.15)",
  purpleBorder: "rgba(127,119,221,0.35)",
  purpleDark: "#3C3489",  // deep purple — headers, buttons
  purpleDeep: "#26215C",  // darkest — pressed states
  purpleLight: "#CECBF6", // light purple — text on dark purple
  purpleSoft:  "#EEEDFE", // very light — bubble backgrounds (light mode feel on dark)
  // text
  text: "#e8e6f8", textMid: "#9d98cc", textDim: "#5a5580", textFaint: "#2e2850",
  // status
  green: "#5db88a", red: "#e07575",
};
const inp = {
  background: C.card, border: `1px solid ${C.border}`,
  borderRadius: 8, color: C.text, fontSize: 13,
  padding: "7px 10px", fontFamily: "inherit", outline: "none",
  width: "100%", boxSizing: "border-box",
};
const btn = (active = true) => ({
  background: active ? C.purpleDark : "rgba(51,46,80,0.5)",
  border: "none", borderRadius: 8,
  color: active ? C.purpleLight : C.textMid,
  fontSize: 13, fontWeight: 600, padding: "8px 16px",
  cursor: active ? "pointer" : "not-allowed",
  fontFamily: "inherit", transition: "all 0.15s",
});
const ghost = {
  background: "rgba(127,119,221,0.08)",
  border: `1px solid ${C.purpleBorder}`,
  borderRadius: 7, color: C.textMid,
  fontSize: 12, padding: "5px 11px",
  cursor: "pointer", fontFamily: "inherit",
};

// ══════════════════════════════════════════════════════════════════════════════
// TOOL PANELS
// ══════════════════════════════════════════════════════════════════════════════

// ── 1. Valve Sizing Calculator ────────────────────────────────────────────────
function ValveSizer() {
  const [app, setApp] = useState("vav_fume_hood");
  const [minCFM, setMinCFM] = useState("");
  const [maxCFM, setMaxCFM] = useState("");
  const [env, setEnv] = useState("research_lab");
  const [result, setResult] = useState(null);

  const SIZES = [
    { size: 6, lp_min: 35, lp_max: 350, mp_min: 35, mp_max: 350 },
    { size: 8, lp_min: 50, lp_max: 700, mp_min: 50, mp_max: 700 },
    { size: 10, lp_min: 50, lp_max: 1000, mp_min: 50, mp_max: 1000 },
    { size: 12, lp_min: 90, lp_max: 1500, mp_min: 90, mp_max: 1500 },
    { size: 14, lp_min: 200, lp_max: 2500, mp_min: 200, mp_max: 2500 },
  ];
  const DUAL_SIZES = [
    { size: "Dual 10\"", min: 100, max: 2000 },
    { size: "Dual 12\"", min: 180, max: 3000 },
    { size: "Dual 14\"", min: 400, max: 5000 },
  ];

  const calc = () => {
    const mn = parseFloat(minCFM), mx = parseFloat(maxCFM);
    if (!mn || !mx || mn >= mx) { setResult({ error: "Enter valid min < max CFM values." }); return; }

    const matches = [];
    for (const s of SIZES) {
      if (mn >= s.lp_min && mx <= s.lp_max) {
        const turndown = Math.round((mx / mn) * 10) / 10;
        const platform = env === "healthcare" ? "Theris" : env === "life_science" ? "Traccel" : "CSCP";
        const control = app === "cv" ? "CV (no actuator)" : "VAV w/ ACM (high-speed)";
        matches.push({ size: `${s.size}"`, range: `${s.lp_min}–${s.lp_max} CFM`, turndown, platform, control, pressure: "Low Pressure (0.3–3.0\" WC)" });
      }
    }
    for (const s of DUAL_SIZES) {
      if (mn >= s.min && mx <= s.max) {
        matches.push({ size: s.size, range: `${s.min}–${s.max} CFM`, turndown: Math.round((mx / mn) * 10) / 10, platform: "CSCP", control: "VAV w/ ACM", pressure: "Low Pressure" });
      }
    }

    const rec = matches[0];
    if (!rec) { setResult({ error: `No single valve covers ${mn}–${mx} CFM. Consider dual-body or multiple valves. Call (800) 340-0007.` }); return; }
    setResult({ matches, rec, mn, mx });
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>Valve Sizing Calculator</div>
      <div style={{ fontSize: 12, color: C.textMid, marginBottom: 18 }}>Find the right valve size and model for your application.</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 4 }}>APPLICATION TYPE</label>
          <select value={app} onChange={e => setApp(e.target.value)} style={inp}>
            <option value="vav_fume_hood">VAV Fume Hood</option>
            <option value="cv">Constant Volume</option>
            <option value="room_supply">Room Supply</option>
            <option value="room_exhaust">Room Exhaust / General</option>
            <option value="two_state">Two-State</option>
          </select></div>
        <div><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 4 }}>ENVIRONMENT</label>
          <select value={env} onChange={e => setEnv(e.target.value)} style={inp}>
            <option value="research_lab">Research Lab</option>
            <option value="healthcare">Healthcare (OR/ICU/AII/PE)</option>
            <option value="life_science">Life Science / Adjacent Space</option>
            <option value="cleanroom">Cleanroom / High Purity Mfg</option>
            <option value="general">General Ventilation</option>
          </select></div>
        <div><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 4 }}>MINIMUM FLOW (CFM)</label>
          <input type="number" value={minCFM} onChange={e => setMinCFM(e.target.value)} placeholder="e.g. 100" style={inp} /></div>
        <div><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 4 }}>MAXIMUM FLOW (CFM)</label>
          <input type="number" value={maxCFM} onChange={e => setMaxCFM(e.target.value)} placeholder="e.g. 1000" style={inp} /></div>
      </div>
      <button onClick={calc} style={{ ...btn(true), marginBottom: 16 }}>Calculate →</button>

      {result?.error && <div style={{ background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.26)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: C.red }}>{result.error}</div>}
      {result?.rec && (
        <div>
          <div style={{ background: C.orangeDim, border: `1px solid ${C.orangeBorder}`, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: C.orange, fontWeight: 700, marginBottom: 8 }}>✓ Recommended: {result.rec.size} Valve</div>
            {[["Flow Range", result.rec.range], ["Your Range", `${result.mn}–${result.mx} CFM`], ["Turndown Ratio", `${result.rec.turndown}:1`], ["Platform", result.rec.platform], ["Control Type", result.rec.control], ["Pressure Range", result.rec.pressure]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                <span style={{ color: C.textMid }}>{k}</span><span style={{ color: C.text, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
          {result.matches.length > 1 && (
            <div>
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>All Compatible Sizes</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {result.matches.map((m, i) => <span key={i} style={{ background: "rgba(22,33,55,0.85)", border: "1px solid rgba(51,65,85,0.6)", borderRadius: 20, padding: "3px 10px", fontSize: 11.5, color: C.textMid }}>{m.size} ({m.range})</span>)}
              </div>
            </div>
          )}
          <div style={{ marginTop: 12, fontSize: 11.5, color: C.textDim, lineHeight: 1.6 }}>
            ℹ All CSCP valves: ±5% accuracy, pressure-independent 0.3–3.0" WC, factory characterized on NVLAP airstations. 5-year warranty. Use Phoenix Controls Valve Selector Tool for full model string.
          </div>
        </div>
      )}
    </div>
  );
}

// ── 2. Face Velocity / CFM Calculator ────────────────────────────────────────
function FVCalc() {
  const [mode, setMode] = useState("fv_to_cfm");
  const [sashW, setSashW] = useState("");
  const [sashH, setSashH] = useState("");
  const [fv, setFv] = useState("");
  const [cfm, setCfm] = useState("");
  const [unit, setUnit] = useState("imperial");
  const [result, setResult] = useState(null);

  const calc = () => {
    const w = parseFloat(sashW), h = parseFloat(sashH);
    if (!w || !h || w <= 0 || h <= 0) { setResult({ error: "Enter valid sash dimensions." }); return; }
    let area, areaLabel;
    if (unit === "imperial") {
      area = (w / 12) * (h / 12);
      areaLabel = `${w}" × ${h}" = ${area.toFixed(3)} ft²`;
    } else {
      area = (w / 1000) * (h / 1000);
      areaLabel = `${w}mm × ${h}mm = ${area.toFixed(4)} m²`;
    }
    if (mode === "fv_to_cfm") {
      const fvVal = parseFloat(fv);
      if (!fvVal) { setResult({ error: "Enter face velocity." }); return; }
      const cfmVal = unit === "imperial" ? fvVal * area : (fvVal * area * 3600);
      const cfmImp = unit === "imperial" ? cfmVal : cfmVal / 1.699;
      const setback = unit === "imperial" ? 80 * area : (80 * area);
      const setbackCFM = unit === "imperial" ? setback : setback / 1.699 * 1.699;
      setResult({
        mode: "fv_to_cfm", area: areaLabel,
        cfm: unit === "imperial" ? `${cfmVal.toFixed(0)} CFM` : `${cfmVal.toFixed(0)} m³/hr (${cfmImp.toFixed(0)} CFM)`,
        fvVal, setbackNote: `Setback @ 80 fpm: ${(80 * (unit === "imperial" ? area : area)).toFixed(0)} ${unit === "imperial" ? "CFM" : "m³/hr"}`,
        alarm: `Flow alarm threshold (typically ≤80% of setpoint): < ${(cfmVal * 0.8).toFixed(0)} ${unit === "imperial" ? "CFM" : "m³/hr"}`,
        status: fvVal >= 100 ? "✓ Meets ASHRAE 100 fpm minimum" : fvVal >= 80 ? "⚠ Below 100 fpm ASHRAE minimum — consider setback application only" : "✗ Below safe minimum face velocity"
      });
    } else {
      const cfmVal = parseFloat(cfm);
      if (!cfmVal) { setResult({ error: "Enter flow (CFM)." }); return; }
      const fvCalc = unit === "imperial" ? cfmVal / area : (cfmVal / area / 3600);
      setResult({
        mode: "cfm_to_fv", area: areaLabel,
        fvResult: unit === "imperial" ? `${fvCalc.toFixed(1)} fpm` : `${(fvCalc * 196.85).toFixed(1)} fpm (${fvCalc.toFixed(3)} m/s)`,
        status: fvCalc >= 100 ? "✓ Meets ASHRAE 100 fpm minimum" : fvCalc >= 80 ? "⚠ Below 100 fpm — may be setback condition" : "✗ Insufficient face velocity — check valve, sash sensor, duct pressure"
      });
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>Face Velocity / CFM Calculator</div>
      <div style={{ fontSize: 12, color: C.textMid, marginBottom: 16 }}>Convert between face velocity (fpm) and airflow (CFM) using sash dimensions.</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {[["fv_to_cfm", "FV → CFM"], ["cfm_to_fv", "CFM → FV"]].map(([v, l]) => (
          <button key={v} onClick={() => { setMode(v); setResult(null); }} style={{ ...ghost, background: mode === v ? C.orangeDim : "transparent", borderColor: mode === v ? C.orangeBorder : "rgba(71,85,105,0.25)", color: mode === v ? C.orange : C.textMid }}>{l}</button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <select value={unit} onChange={e => { setUnit(e.target.value); setResult(null); }} style={{ ...inp, width: "auto", padding: "5px 8px", fontSize: 12 }}>
            <option value="imperial">Imperial (in, fpm, CFM)</option>
            <option value="metric">Metric (mm, m/s, m³/hr)</option>
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 4 }}>SASH WIDTH ({unit === "imperial" ? "inches" : "mm"})</label><input type="number" value={sashW} onChange={e => setSashW(e.target.value)} placeholder={unit === "imperial" ? "e.g. 36" : "e.g. 900"} style={inp} /></div>
        <div><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 4 }}>SASH HEIGHT (OPEN) ({unit === "imperial" ? "inches" : "mm"})</label><input type="number" value={sashH} onChange={e => setSashH(e.target.value)} placeholder={unit === "imperial" ? "e.g. 14" : "e.g. 355"} style={inp} /></div>
        {mode === "fv_to_cfm"
          ? <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 4 }}>FACE VELOCITY ({unit === "imperial" ? "fpm" : "m/s"})</label><input type="number" value={fv} onChange={e => setFv(e.target.value)} placeholder={unit === "imperial" ? "e.g. 100" : "e.g. 0.508"} style={inp} /></div>
          : <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 4 }}>AIRFLOW ({unit === "imperial" ? "CFM" : "m³/hr"})</label><input type="number" value={cfm} onChange={e => setCfm(e.target.value)} placeholder={unit === "imperial" ? "e.g. 500" : "e.g. 850"} style={inp} /></div>}
      </div>
      <button onClick={calc} style={{ ...btn(true), marginBottom: 14 }}>Calculate →</button>
      {result?.error && <div style={{ background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.26)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: C.red }}>{result.error}</div>}
      {result && !result.error && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>Open Sash Area: <span style={{ color: C.text }}>{result.area}</span></div>
          {result.mode === "fv_to_cfm" ? <>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.orange, marginBottom: 6 }}>{result.cfm}</div>
            <div style={{ fontSize: 12, color: C.textMid, marginBottom: 4 }}>{result.setbackNote}</div>
            <div style={{ fontSize: 12, color: C.textMid, marginBottom: 8 }}>{result.alarm}</div>
          </> : <>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.orange, marginBottom: 8 }}>{result.fvResult}</div>
          </>}
          <div style={{ fontSize: 12, padding: "7px 10px", borderRadius: 7, background: result.status.startsWith("✓") ? "rgba(34,197,94,0.1)" : result.status.startsWith("⚠") ? "rgba(234,179,8,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${result.status.startsWith("✓") ? "rgba(34,197,94,0.25)" : result.status.startsWith("⚠") ? "rgba(234,179,8,0.25)" : "rgba(239,68,68,0.25)"}`, color: result.status.startsWith("✓") ? "#4ade80" : result.status.startsWith("⚠") ? "#fbbf24" : C.red }}>{result.status}</div>
        </div>
      )}
    </div>
  );
}

// ── 3. Wiring Diagram Generator ───────────────────────────────────────────────
function WiringGen({ onAsk }) {
  const [display, setDisplay] = useState("FHD500");
  const [valve, setValve] = useState("VAV_ACM");
  const [sash, setSash] = useState("VSS");
  const [zps, setZps] = useState(true);
  const [rpi, setRpi] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = () => {
    const prompt = `Generate a detailed wiring diagram description and terminal connection table for this Phoenix Controls system configuration:
- Display/Monitor: ${display}
- Valve Type: ${valve}
- Sash Sensor: ${sash}
- Zone Presence Sensor (ZPS): ${zps ? "Yes" : "No"}
- Room Pressure Indicator (RPI500): ${rpi ? "Yes" : "No"}

Include:
1. Every terminal block connection (TB#, pin #, wire label, wire gauge, destination)
2. Power wiring (24VAC source, common, grounding)
3. Communication wiring (BACnet MS/TP RS485 A/B, termination resistor placement)
4. Sensor wiring (sash sensor, ZPS if present)
5. Any special wiring notes or precautions for this configuration
Format as a clear terminal-by-terminal table, then add wiring notes.`;
    setGenerated(true);
    onAsk(prompt);
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>Wiring Diagram Generator</div>
      <div style={{ fontSize: 12, color: C.textMid, marginBottom: 16 }}>Configure your system and generate a terminal connection guide.</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 4 }}>DISPLAY / MONITOR</label>
          <select value={display} onChange={e => setDisplay(e.target.value)} style={inp}>
            <option value="FHD500">FHD500 (CSCP)</option>
            <option value="FHM631">FHM631 X30 (legacy)</option>
            <option value="FHM430">FHM430 X30 (legacy)</option>
            <option value="FHM530">FHM530 X30 (legacy)</option>
            <option value="None">None (PBC only)</option>
          </select></div>
        <div><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 4 }}>VALVE / CONTROLLER</label>
          <select value={valve} onChange={e => setValve(e.target.value)} style={inp}>
            <option value="VAV_ACM">VAV + ACM (CSCP High-Speed)</option>
            <option value="VAV_SSR">VAV + SSR (CSCP Standard-Speed)</option>
            <option value="CV">Constant Volume (no electronics)</option>
            <option value="Celeris_HS">Celeris High-Speed (LonWorks)</option>
            <option value="Celeris_LS">Celeris Low-Speed (LonWorks)</option>
            <option value="Traccel">Traccel (LonWorks)</option>
          </select></div>
        <div><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 4 }}>SASH SENSOR TYPE</label>
          <select value={sash} onChange={e => setSash(e.target.value)} style={inp}>
            <option value="VSS">VSS (Vertical)</option>
            <option value="HSS">HSS (Horizontal)</option>
            <option value="CSS">CSS (Combination)</option>
            <option value="None">None / CV Hood</option>
          </select></div>
        <div><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 4 }}>ADDITIONAL DEVICES</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            {[["ZPS (Zone Presence Sensor)", zps, setZps], ["RPI500 (Room Pressure Indicator)", rpi, setRpi]].map(([l, v, s]) => (
              <label key={l} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.textMid, cursor: "pointer" }}>
                <input type="checkbox" checked={v} onChange={e => s(e.target.checked)} style={{ accentColor: C.orange }} />{l}
              </label>
            ))}
          </div>
        </div>
      </div>
      <button onClick={generate} style={btn(true)}>Generate Wiring Guide →</button>
      {generated && <div style={{ marginTop: 12, fontSize: 12, color: C.textDim, fontStyle: "italic" }}>↓ See the AI Tech response in the Chat tab</div>}
    </div>
  );
}

// ── 4. Commissioning Checklist ────────────────────────────────────────────────
const CHECKLISTS = {
  CSCP: [
    { section: "Pre-Power", items: ["Verify all valves installed per drawings", "Check ACM mounting (direct on valve body)", "Verify 24VAC power to PBC and all ACMs", "Check MS/TP wiring: RS485 A/B, twisted pair, no shorts", "Install terminating resistors at both physical ends of MS/TP trunk", "Verify Ethernet/STP loop connections to PBC", "Check sash sensor wiring to FHD500 UIO ports", "Verify ZPS wiring if present"] },
    { section: "PBC Commissioning", items: ["Power up PBC — wait 15s for DHCP IP assignment", "Find IP address: run 'arp -a' in Windows CMD", "Connect Phoenix Controls Workbench (PBC-CT)", "Build device hierarchy: Zone → PBC → ACMs → FHDs", "Configure zone mode: ZBH (high-speed) or ZBL (standard-speed)", "Set BACnet device instance (unique on network)", "Set MS/TP baud rate (match all devices)", "Pair each ACM to valve by serial number", "Download configuration to all devices"] },
    { section: "FHD500 Setup Wizard", items: ["Set language", "Set Administrator PIN (6-digit)", "Set Operator PIN (4-digit)", "Configure BACnet MS/TP (MAC address, baud, device instance)", "Select application type (VAV/CVV/2-State/Drive)", "Select sash sensor type (VSS/HSS/CSS/None)", "Pair FHD500 to ACM/PBC", "Set display brightness and units", "Enter face velocity setpoint (normal: 100 fpm)", "Enter setback face velocity (typical: 80 fpm)", "Enter sash dimensions (W × H in inches)", "Set physical flow limits (min/max CFM)", "Set alarm thresholds and delay", "Save and confirm"] },
    { section: "Sash Sensor Calibration", items: ["Open sash to fully open position", "Record resistance (kΩ) or voltage at FHD500", "Close sash fully", "Record resistance (kΩ) or voltage at FHD500", "Enter both values in FHD500 calibration", "Verify FHD500 tracks sash position correctly"] },
    { section: "Functional Verification", items: ["Command each valve open/closed from Flow Manager App", "Verify valve reaches commanded position (Vpot feedback)", "Open fume hood sash — confirm CFM increases with sash", "Verify face velocity alarm clears at normal operation", "Test emergency exhaust override", "Verify volumetric offset: all hoods closed → exhaust = supply + offset", "Test ZPS setback if installed", "Check Flow Manager App T&B tool readings vs. design CFM", "Confirm all BACnet points readable at BMS", "Document final setpoints on Record Drawings"] },
  ],
  X30_FHM: [
    { section: "Tools Required", items: ["Room Schedule Sheet (RSS) from engineer", "Tape measure", "Digital voltmeter", "Magnehelic gauge (optional)"] },
    { section: "Pre-Commissioning", items: ["Verify FHM mounted correctly at fume hood", "Check power supply (same source as exhaust valve)", "Verify sash sensor wiring at TB1", "Check valve wiring at TB2", "Confirm ZPS wiring if setback required (DC power only)"] },
    { section: "Enter Calibration Mode", items: ["Press and hold both buttons on FHM faceplate until display changes", "Er_c or blinking LEDs confirm uncommissioned state", "Navigate through 23 parameters using faceplate buttons"] },
    { section: "23 Calibration Parameters", items: ["1. Units (ft/min or CFM)", "2. Normal face velocity setpoint (from RSS)", "3. Setback face velocity (from RSS, typically 60–80 fpm)", "4. Alarm low face velocity threshold", "5. Alarm high face velocity threshold", "6. Sash width (inches, from tape measure)", "7. Sash max height (fully open, inches)", "8. Maximum hood flow (CFM)", "9. Minimum sash opening (FHM631/430 only)", "10. Sash sensor open value (measure with voltmeter)", "11. Sash sensor closed value (measure with voltmeter)", "12. Minimum supply flow", "13. Minimum setback clamp", "14. Alarm delay (seconds)", "15. Sash switch point / broken sash threshold", "16. Sash fully closed threshold", "17. Broken sash threshold", "18. Emergency mutable (Y/N)", "19. Beeper volume", "20. Auto mute (Y/N)", "21. Mute duration (seconds)", "22. Energy waste alert (FHM631 only — light intensity threshold)", "23. Decommission/hibernation mode (FHM631 only)"] },
    { section: "Post-Calibration Verification", items: ["Confirm normal operation LED steady (no alarms)", "Open sash fully — verify CFM at hood matches setpoint", "Partially open sash — verify proportional CFM", "Activate ZPS setback — verify flow reduces", "Trigger emergency exhaust — verify response", "Confirm alarm conditions clear properly", "Record all setpoints on Record Drawings"] },
  ],
  Celeris: [
    { section: "Pre-Commissioning", items: ["Verify LVC mounted on valve body or nearby", "Check 24VAC power wiring to LVC", "Verify LonWorks network wiring (TP/FT-10 twisted pair)", "Check termination at end of each LonWorks segment", "Verify sash sensor wiring to LVC inputs"] },
    { section: "LonWorks Commissioning", items: ["Connect LonWorks network management tool", "Commission each node (bind to network)", "Download flow characterization curve to each LVC", "Set supply/exhaust CFM offset", "Configure face velocity setpoints", "Set alarm thresholds"] },
    { section: "Verification", items: ["Verify each valve responds to flow commands", "Check flow tracking between supply/exhaust pair", "Verify pressurization offset maintained", "Test emergency override", "Confirm BACnet integration points readable"] },
  ],
};

function CommissioningChecklist() {
  const [platform, setPlatform] = useState("CSCP");
  const [checked, setChecked] = useState({});
  const [location, setLocation] = useState("");
  const [techName, setTechName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const list = CHECKLISTS[platform] || [];
  const allItems = list.flatMap((s, si) => s.items.map((_, ii) => `${si}-${ii}`));
  const doneCount = allItems.filter(k => checked[`${platform}-${k}`]).length;
  const pct = allItems.length ? Math.round((doneCount / allItems.length) * 100) : 0;

  const toggle = (key) => setChecked(p => ({ ...p, [key]: !p[key] }));
  const reset = () => setChecked(p => { const n = { ...p }; allItems.forEach(k => delete n[`${platform}-${k}`]); return n; });
  const allDone = () => { const n = { ...checked }; allItems.forEach(k => n[`${platform}-${k}`] = true); setChecked(n); };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>Commissioning Checklist</div>
      <div style={{ fontSize: 12, color: C.textMid, marginBottom: 14 }}>Step-by-step commissioning for each platform. Check off as you go — progress is saved.</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        <div><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 3 }}>PLATFORM</label>
          <select value={platform} onChange={e => setPlatform(e.target.value)} style={inp}>
            <option value="CSCP">CSCP (PBC + ACM + FHD500)</option>
            <option value="X30_FHM">X30 Series FHM (FHM430/530/631)</option>
            <option value="Celeris">Celeris (LonWorks LVC)</option>
          </select></div>
        <div><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 3 }}>LOCATION / ROOM</label>
          <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Lab 201, Hood #3" style={inp} /></div>
        <div><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 3 }}>TECH / DATE</label>
          <div style={{ display: "flex", gap: 6 }}>
            <input value={techName} onChange={e => setTechName(e.target.value)} placeholder="Tech name" style={{ ...inp, flex: 1 }} />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inp, width: 130 }} />
          </div></div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 12, color: C.textMid }}>{doneCount} / {allItems.length} steps complete</span>
          <div style={{ display: "flex", gap: 7 }}>
            <button onClick={reset} style={{ ...ghost, fontSize: 11, padding: "3px 8px" }}>Reset</button>
            <button onClick={allDone} style={{ ...ghost, fontSize: 11, padding: "3px 8px" }}>Check all</button>
          </div>
        </div>
        <div style={{ background: "rgba(51,65,85,0.4)", borderRadius: 10, height: 8, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "#4ade80" : C.orange, borderRadius: 10, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Checklist */}
      <div style={{ maxHeight: 440, overflowY: "auto" }}>
        {list.map((section, si) => (
          <div key={si} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.orange, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7, paddingBottom: 4, borderBottom: "1px solid rgba(249,115,22,0.15)" }}>{section.section}</div>
            {section.items.map((item, ii) => {
              const key = `${platform}-${si}-${ii}`;
              const done = !!checked[key];
              return (
                <label key={ii} onClick={() => toggle(key)} style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 7, cursor: "pointer", padding: "5px 8px", borderRadius: 7, background: done ? "rgba(34,197,94,0.07)" : "transparent", transition: "background 0.15s" }}>
                  <div style={{ width: 17, height: 17, borderRadius: 4, border: `2px solid ${done ? "#4ade80" : "rgba(71,85,105,0.5)"}`, background: done ? "rgba(34,197,94,0.2)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, transition: "all 0.15s" }}>
                    {done && <span style={{ color: "#4ade80", fontSize: 10, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 12.5, color: done ? "#64748b" : C.textMid, textDecoration: done ? "line-through" : "none", lineHeight: 1.5 }}>{item}</span>
                </label>
              );
            })}
          </div>
        ))}
      </div>
      {pct === 100 && <div style={{ marginTop: 10, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "#4ade80", textAlign: "center" }}>✓ Commissioning complete{location ? ` — ${location}` : ""}{techName ? ` | ${techName}` : ""} | {date}</div>}
    </div>
  );
}

// ── 5. Alarm History Log ──────────────────────────────────────────────────────
function AlarmLog({ onAsk }) {
  const [alarms, setAlarms] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], location: "", device: "", alarmType: "", description: "", resolution: "", status: "open" });
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => { stor_get(ALARMS_KEY).then(d => { setAlarms(d || []); setLoaded(true); }); }, []);
  useEffect(() => { if (loaded) stor_set(ALARMS_KEY, alarms); }, [alarms, loaded]);

  const save = () => {
    if (!form.location || !form.alarmType) return;
    if (editId) {
      setAlarms(p => p.map(a => a.id === editId ? { ...form, id: editId } : a));
      setEditId(null);
    } else {
      setAlarms(p => [{ ...form, id: makeId(), createdAt: Date.now() }, ...p]);
    }
    setForm({ date: new Date().toISOString().split("T")[0], location: "", device: "", alarmType: "", description: "", resolution: "", status: "open" });
    setAdding(false);
  };

  const del = (id) => setAlarms(p => p.filter(a => a.id !== id));
  const edit = (a) => { setForm({ ...a }); setEditId(a.id); setAdding(true); };
  const askAI = (a) => onAsk(`I have a Phoenix Controls alarm log entry: Location: ${a.location}, Device: ${a.device}, Alarm: ${a.alarmType}, Description: ${a.description}. Please help me diagnose and resolve this.`);

  const filtered = alarms.filter(a => [a.location, a.device, a.alarmType, a.description].join(" ").toLowerCase().includes(search.toLowerCase()));
  const ALARM_TYPES = ["Flow Alarm", "Pressure Alarm", "Jam Alarm", "Face Velocity Low", "Face Velocity High", "Communication / Unlinked", "FSM Not Charging", "Sash Open / ENRG", "ER_C (Not Commissioned)", "Other"];

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>Alarm History Log</div>
        <button onClick={() => { setAdding(!adding); setEditId(null); setForm({ date: new Date().toISOString().split("T")[0], location: "", device: "", alarmType: "", description: "", resolution: "", status: "open" }); }} style={btn(true)}>+ Log Alarm</button>
      </div>
      <div style={{ fontSize: 12, color: C.textMid, marginBottom: 14 }}>Track alarms by location, device, and resolution for recurring issue detection.</div>

      {adding && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.orange, marginBottom: 10 }}>{editId ? "Edit" : "New"} Alarm Entry</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div><label style={{ fontSize: 10.5, color: C.textDim, display: "block", marginBottom: 3 }}>DATE</label><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inp} /></div>
            <div><label style={{ fontSize: 10.5, color: C.textDim, display: "block", marginBottom: 3 }}>STATUS</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={inp}>
                <option value="open">Open</option><option value="resolved">Resolved</option><option value="recurring">Recurring</option>
              </select></div>
            <div><label style={{ fontSize: 10.5, color: C.textDim, display: "block", marginBottom: 3 }}>LOCATION *</label><input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Lab 201 - Hood 3" style={inp} /></div>
            <div><label style={{ fontSize: 10.5, color: C.textDim, display: "block", marginBottom: 3 }}>DEVICE / MODEL</label><input value={form.device} onChange={e => setForm(p => ({ ...p, device: e.target.value }))} placeholder="e.g. FHD500, ACM, PBC" style={inp} /></div>
            <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: 10.5, color: C.textDim, display: "block", marginBottom: 3 }}>ALARM TYPE *</label>
              <select value={form.alarmType} onChange={e => setForm(p => ({ ...p, alarmType: e.target.value }))} style={inp}>
                <option value="">Select...</option>{ALARM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select></div>
            <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: 10.5, color: C.textDim, display: "block", marginBottom: 3 }}>DESCRIPTION</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="What happened, what was observed..." style={{ ...inp, resize: "none" }} /></div>
            <div style={{ gridColumn: "1/-1" }}><label style={{ fontSize: 10.5, color: C.textDim, display: "block", marginBottom: 3 }}>RESOLUTION / NOTES</label><textarea value={form.resolution} onChange={e => setForm(p => ({ ...p, resolution: e.target.value }))} rows={2} placeholder="How it was resolved, parts replaced, etc." style={{ ...inp, resize: "none" }} /></div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} style={btn(!!(form.location && form.alarmType))}>Save</button>
            <button onClick={() => { setAdding(false); setEditId(null); }} style={ghost}>Cancel</button>
          </div>
        </div>
      )}

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alarms by location, device, or type…" style={{ ...inp, marginBottom: 10 }} />

      <div style={{ maxHeight: 420, overflowY: "auto" }}>
        {filtered.length === 0 && <div style={{ fontSize: 12, color: C.textDim, textAlign: "center", padding: 24 }}>No alarm entries yet. Log your first alarm above.</div>}
        {filtered.map(a => (
          <div key={a.id} style={{ background: C.card, border: `1px solid ${a.status === "recurring" ? "rgba(239,68,68,0.3)" : a.status === "resolved" ? "rgba(34,197,94,0.2)" : C.border}`, borderRadius: 10, padding: "11px 13px", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 5 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{a.alarmType}</span>
                <span style={{ fontSize: 11, color: a.status === "recurring" ? C.red : a.status === "resolved" ? "#4ade80" : "#fbbf24", background: a.status === "recurring" ? "rgba(239,68,68,0.12)" : a.status === "resolved" ? "rgba(34,197,94,0.12)" : "rgba(234,179,8,0.12)", borderRadius: 10, padding: "1px 7px", marginLeft: 8 }}>{a.status}</span>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                <button onClick={() => askAI(a)} title="Ask AI" style={{ ...ghost, fontSize: 11, padding: "3px 7px" }}>🤖 Ask AI</button>
                <button onClick={() => edit(a)} style={{ ...ghost, fontSize: 11, padding: "3px 7px" }}>✏</button>
                <button onClick={() => del(a.id)} style={{ ...ghost, fontSize: 11, padding: "3px 7px", color: C.red }}>✕</button>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: C.textDim }}>{a.date} · {a.location}{a.device ? ` · ${a.device}` : ""}</div>
            {a.description && <div style={{ fontSize: 12, color: C.textMid, marginTop: 5, lineHeight: 1.5 }}>{a.description}</div>}
            {a.resolution && <div style={{ fontSize: 11.5, color: "#4ade80", marginTop: 4, fontStyle: "italic" }}>✓ {a.resolution}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 6. BACnet MS/TP Network Calculator ───────────────────────────────────────
function BACnetCalc() {
  const [baud, setBaud] = useState("76800");
  const [cable, setCable] = useState("Belden3105A");
  const [pbcCount, setPbcCount] = useState("");
  const [acmCount, setAcmCount] = useState("");
  const [fhdCount, setFhdCount] = useState("");
  const [otherCount, setOtherCount] = useState("");
  const [result, setResult] = useState(null);

  const CABLES = {
    "Belden3105A": { name: "Belden 3105A (22AWG shielded)", impedance: 120, capPF: 12.5, maxLen: { 9600: 1200, 19200: 900, 38400: 600, 76800: 400, 115200: 300 } },
    "Belden9842": { name: "Belden 9842 (22AWG shielded)", impedance: 120, capPF: 13, maxLen: { 9600: 1200, 19200: 900, 38400: 600, 76800: 400, 115200: 300 } },
    "Generic18AWG": { name: "Generic 18AWG shielded pair", impedance: 100, capPF: 20, maxLen: { 9600: 900, 19200: 600, 38400: 400, 76800: 250, 115200: 150 } },
  };

  const calc = () => {
    const pbc = parseInt(pbcCount) || 0, acm = parseInt(acmCount) || 0, fhd = parseInt(fhdCount) || 0, other = parseInt(otherCount) || 0;
    const total = pbc + acm + fhd + other;
    const cab = CABLES[cable];
    const maxLen = cab.maxLen[parseInt(baud)];
    const issues = [];
    if (total > 128) issues.push(`Total device count (${total}) exceeds BACnet MS/TP maximum of 128 devices per segment.`);
    if (pbc > 39) issues.push(`PBC count (${pbc}) exceeds Phoenix Controls STP loop maximum of 39 PBCs per switch.`);
    if (acm > 127) issues.push(`ACM count (${acm}) — each PBC supports up to 20 ACMs on its MS/TP trunk.`);
    const pbcPerTrunk = Math.ceil(acm / 20);
    const macWarning = total > 60 ? "High device count — allow extra time for MAC address assignment and token rotation." : null;
    setResult({ total, pbc, acm, fhd, other, cab, maxLen, baud, issues, pbcPerTrunk, macWarning, termRes: `${cab.impedance}Ω at each physical end of bus` });
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>BACnet MS/TP Network Calculator</div>
      <div style={{ fontSize: 12, color: C.textMid, marginBottom: 16 }}>Validate your MS/TP network: device counts, baud rate, cable length, and termination.</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 3 }}>BAUD RATE</label>
          <select value={baud} onChange={e => setBaud(e.target.value)} style={inp}>
            {[9600, 19200, 38400, 76800, 115200].map(b => <option key={b} value={b}>{b.toLocaleString()} bps</option>)}
          </select></div>
        <div><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 3 }}>CABLE TYPE</label>
          <select value={cable} onChange={e => setCable(e.target.value)} style={inp}>
            {Object.entries(CABLES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select></div>
        {[["PBCs", pbcCount, setPbcCount], ["ACMs", acmCount, setAcmCount], ["FHD500s", fhdCount, setFhdCount], ["Other MS/TP Devices", otherCount, setOtherCount]].map(([l, v, s]) => (
          <div key={l}><label style={{ fontSize: 11, color: C.textDim, display: "block", marginBottom: 3 }}>{l.toUpperCase()}</label><input type="number" value={v} onChange={e => s(e.target.value)} placeholder="0" style={inp} /></div>
        ))}
      </div>
      <button onClick={calc} style={{ ...btn(true), marginBottom: 14 }}>Validate Network →</button>
      {result && (
        <div>
          {result.issues.length > 0 && (
            <div style={{ background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.26)", borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
              {result.issues.map((iss, i) => <div key={i} style={{ fontSize: 12.5, color: C.red, marginBottom: i < result.issues.length - 1 ? 4 : 0 }}>⚠ {iss}</div>)}
            </div>
          )}
          {result.issues.length === 0 && (
            <div style={{ background: "rgba(34,197,94,0.09)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 10, fontSize: 12.5, color: "#4ade80" }}>✓ Network configuration looks valid</div>
          )}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 15px" }}>
            {[
              ["Total MS/TP Devices", result.total],
              ["Max Cable Length @ " + parseInt(result.baud).toLocaleString() + " bps", `${result.maxLen}m (${Math.round(result.maxLen * 3.281)}ft)`],
              ["Termination Resistors", result.termRes],
              ["Recommended PBC Trunks for ACMs", result.acm > 0 ? `${result.pbcPerTrunk} trunk(s) — ${Math.ceil(result.acm / result.pbcPerTrunk)} ACMs/PBC` : "N/A"],
              ["Max PBCs per STP Loop", "39 (Phoenix Controls limit)"],
              ["BACnet MAC Address Range", "1–127 (0 = master, avoid 255)"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6, paddingBottom: 6, borderBottom: "1px solid rgba(51,65,85,0.3)" }}>
                <span style={{ color: C.textMid }}>{k}</span><span style={{ color: C.text, fontWeight: 500, textAlign: "right", maxWidth: "55%" }}>{v}</span>
              </div>
            ))}
            {result.macWarning && <div style={{ fontSize: 11.5, color: "#fbbf24", marginTop: 4 }}>⚠ {result.macWarning}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 7. Model Number Decoder ───────────────────────────────────────────────────
function ModelDecoder({ onAsk }) {
  const [model, setModel] = useState("");
  const [result, setResult] = useState(null);

  const decode = () => {
    if (!model.trim()) return;
    const prompt = `Decode this Phoenix Controls model number/string completely: "${model.trim()}"
Break down every character/segment of the model string and explain what it means. Include:
1. Product line / platform identification
2. Valve size (if applicable)
3. Pressure range code
4. Control type / actuator type
5. Construction / material code
6. Flow range (min/max CFM) for this exact model
7. Any options or accessories encoded in the model string
8. Compatible controllers, ACM, sash sensors, and accessories
9. Platform generation (CSCP, Celeris, Traccel, Theris, legacy)
10. Any important notes (EOL status, firmware, known issues)
Format as a clear table with: Field | Code | Meaning`;
    setResult("asking");
    onAsk(prompt);
  };

  const EXAMPLES = ["CSCP-VAV-8-LP-D", "BXV-VAV-112-DCN-F", "FHM631-ENG", "PBC-D", "ACM-500", "FHD500-VAV"];

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>Model Number Decoder</div>
      <div style={{ fontSize: 12, color: C.textMid, marginBottom: 16 }}>Paste any Phoenix Controls model string and get a complete field-by-field breakdown.</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input value={model} onChange={e => setModel(e.target.value)} onKeyDown={e => e.key === "Enter" && decode()} placeholder="Paste model number here (e.g. BXV-VAV-112-DCN-F)" style={{ ...inp, flex: 1 }} />
        <button onClick={decode} style={btn(!!model.trim())}>Decode →</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 6 }}>EXAMPLES</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {EXAMPLES.map(e => <button key={e} onClick={() => setModel(e)} style={{ ...ghost, fontSize: 11, padding: "3px 9px" }}>{e}</button>)}
        </div>
      </div>
      {result === "asking" && <div style={{ fontSize: 12, color: C.textDim, fontStyle: "italic" }}>↓ See full decode in the Chat tab</div>}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 11, padding: "13px 15px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.orange, marginBottom: 8 }}>How to read Phoenix Controls model strings</div>
        {[["Valve family", "BXV = Accel II standard, BXVxx = size (6,8,10,12,14 inch)"],
          ["Platform code", "D = CSCP high-speed ACM, E = Celeris LonWorks, H/I = standard-speed, B = pneumatic, C = CV"],
          ["Pressure range", "M = Medium (0.5–3.0\" WC), L = Low (0.3–3.0\" WC)"],
          ["Construction", "A = uncoated galv., C = corrosion resistant, SS = stainless steel"],
          ["Control designation", "F/G/S = with flow feedback, N = no feedback, B/U = base upgradable"],
          ["Options", "FSM = fail-safe module, REI = remote electronics indoor, WRE = weather resistant"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 10, fontSize: 11.5, marginBottom: 5 }}>
            <span style={{ color: C.textDim, minWidth: 120, flexShrink: 0 }}>{k}</span>
            <span style={{ color: C.textMid }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 8. Asset Registry ────────────────────────────────────────────────────────
function AssetRegistry({ onAsk }) {
  const [assets, setAssets] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ building: "", floor: "", room: "", hood: "", model: "", serial: "", firmware: "", minCFM: "", maxCFM: "", commDate: "", tech: "", notes: "", status: "active" });

  useEffect(() => { stor_get(ASSETS_KEY).then(d => { setAssets(d || []); setLoaded(true); }); }, []);
  useEffect(() => { if (loaded) stor_set(ASSETS_KEY, assets); }, [assets, loaded]);

  const save = () => {
    if (!form.room || !form.model) return;
    if (editId) {
      setAssets(p => p.map(a => a.id === editId ? { ...form, id: editId, updatedAt: Date.now() } : a));
      setEditId(null);
    } else {
      setAssets(p => [{ ...form, id: makeId(), createdAt: Date.now() }, ...p]);
    }
    setForm({ building: "", floor: "", room: "", hood: "", model: "", serial: "", firmware: "", minCFM: "", maxCFM: "", commDate: "", tech: "", notes: "", status: "active" });
    setAdding(false);
  };

  const del = (id) => setAssets(p => p.filter(a => a.id !== id));
  const edit = (a) => { setForm({ ...a }); setEditId(a.id); setAdding(true); };
  const askAI = (a) => onAsk(`I need information about this Phoenix Controls valve: Model: ${a.model}, Serial: ${a.serial}, Location: ${a.building} / ${a.room}${a.hood ? " / " + a.hood : ""}. Flow range: ${a.minCFM}–${a.maxCFM} CFM. Please look up this model, tell me about compatible parts, current documentation, and any known issues.`);

  const filtered = assets.filter(a => [a.building, a.room, a.hood, a.model, a.serial].join(" ").toLowerCase().includes(search.toLowerCase()));

  const FORM_FIELDS = [
    [["BUILDING", "building", "e.g. Building A"], ["FLOOR", "floor", "e.g. 2nd Floor"]],
    [["ROOM / LAB", "room", "e.g. Lab 201 *"], ["HOOD / UNIT #", "hood", "e.g. Hood 3"]],
    [["MODEL NUMBER *", "model", "e.g. BXV-VAV-112-DCN-F"], ["SERIAL NUMBER", "serial", "e.g. SN123456"]],
    [["FIRMWARE VERSION", "firmware", "e.g. v2.1.0"], ["STATUS", "status", null, ["active", "decommissioned", "maintenance"]]],
    [["MIN CFM", "minCFM", "e.g. 100"], ["MAX CFM", "maxCFM", "e.g. 1000"]],
    [["COMMISSIONED DATE", "commDate", null, null, "date"], ["COMMISSIONING TECH", "tech", "Name"]],
  ];

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>Equipment Registry</div>
        <button onClick={() => { setAdding(!adding); setEditId(null); setForm({ building: "", floor: "", room: "", hood: "", model: "", serial: "", firmware: "", minCFM: "", maxCFM: "", commDate: "", tech: "", notes: "", status: "active" }); }} style={btn(true)}>+ Add Asset</button>
      </div>
      <div style={{ fontSize: 12, color: C.textMid, marginBottom: 14 }}>Log valves and controllers by location. Track model, serial, firmware, commissioning date, and flow specs.</div>

      {adding && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.orange, marginBottom: 10 }}>{editId ? "Edit" : "New"} Asset</div>
          {FORM_FIELDS.map((row, ri) => (
            <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
              {row.map(([label, field, placeholder, options, type]) => (
                <div key={field}><label style={{ fontSize: 10.5, color: C.textDim, display: "block", marginBottom: 3 }}>{label}</label>
                  {options ? (
                    <select value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} style={inp}>
                      {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={type || "text"} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} placeholder={placeholder || ""} style={inp} />
                  )}
                </div>
              ))}
            </div>
          ))}
          <div style={{ marginBottom: 10 }}><label style={{ fontSize: 10.5, color: C.textDim, display: "block", marginBottom: 3 }}>NOTES</label><textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Any field notes, issues, modifications…" style={{ ...inp, resize: "none" }} /></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} style={btn(!!(form.room && form.model))}>Save Asset</button>
            <button onClick={() => { setAdding(false); setEditId(null); }} style={ghost}>Cancel</button>
          </div>
        </div>
      )}

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by room, model, or serial number…" style={{ ...inp, marginBottom: 10 }} />
      <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8 }}>{assets.length} asset{assets.length !== 1 ? "s" : ""} logged</div>

      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        {filtered.length === 0 && <div style={{ fontSize: 12, color: C.textDim, textAlign: "center", padding: 24 }}>No assets logged yet. Add your first valve or controller above.</div>}
        {filtered.map(a => (
          <div key={a.id} style={{ background: C.card, border: `1px solid ${a.status === "decommissioned" ? "rgba(71,85,105,0.4)" : C.border}`, borderRadius: 10, padding: "11px 13px", marginBottom: 8, opacity: a.status === "decommissioned" ? 0.6 : 1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{a.model}</span>
                  {a.serial && <span style={{ fontSize: 11, color: C.textDim }}>S/N: {a.serial}</span>}
                  <span style={{ fontSize: 11, color: a.status === "active" ? "#4ade80" : a.status === "maintenance" ? "#fbbf24" : C.textDim, background: a.status === "active" ? "rgba(34,197,94,0.1)" : a.status === "maintenance" ? "rgba(234,179,8,0.1)" : "rgba(71,85,105,0.15)", borderRadius: 10, padding: "1px 7px" }}>{a.status}</span>
                </div>
                <div style={{ fontSize: 11.5, color: C.textDim, marginBottom: 3 }}>{[a.building, a.floor, a.room, a.hood].filter(Boolean).join(" › ")}</div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  {a.minCFM && a.maxCFM && <span style={{ fontSize: 11.5, color: C.textMid }}>{a.minCFM}–{a.maxCFM} CFM</span>}
                  {a.firmware && <span style={{ fontSize: 11.5, color: C.textMid }}>FW: {a.firmware}</span>}
                  {a.commDate && <span style={{ fontSize: 11.5, color: C.textMid }}>Comm: {a.commDate}</span>}
                  {a.tech && <span style={{ fontSize: 11.5, color: C.textMid }}>Tech: {a.tech}</span>}
                </div>
                {a.notes && <div style={{ fontSize: 11.5, color: C.textDim, marginTop: 5, fontStyle: "italic" }}>{a.notes}</div>}
              </div>
              <div style={{ display: "flex", gap: 5, flexShrink: 0, marginLeft: 10 }}>
                <button onClick={() => askAI(a)} style={{ ...ghost, fontSize: 11, padding: "3px 7px" }}>🤖</button>
                <button onClick={() => edit(a)} style={{ ...ghost, fontSize: 11, padding: "3px 7px" }}>✏</button>
                <button onClick={() => del(a.id)} style={{ ...ghost, fontSize: 11, padding: "3px 7px", color: C.red }}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// QUICK PROMPTS (for Chat tab)
// ══════════════════════════════════════════════════════════════════════════════
const QUICK_PROMPTS = [
  { icon: "📷", label: "Read data plate", text: "I'm uploading a data plate photo — read every field, identify the product, decode the model string, and tell me compatible parts." },
  { icon: "📊", label: "Analyze flowchart", text: "I'm uploading a control flow chart / sequence of operations — read and interpret it completely." },
  { icon: "🔴", label: "FHD500 flashing red", text: "My FHD500 is showing a flashing red screen. What alarm is this and how do I clear it?" },
  { icon: "🌐", label: "PBC not on BACnet", text: "My PBC won't show up on the BACnet network. Full troubleshooting please." },
  { icon: "⚡", label: "ACM not responding", text: "The ACM on my venturi valve is not responding on the MS/TP trunk. What do I check?" },
  { icon: "💨", label: "Face velocity low alarm", text: "I'm getting a face velocity low alarm on a fume hood. Full diagnostic walkthrough please." },
  { icon: "🔧", label: "FHD500 setup wizard", text: "Walk me through every step of the FHD500 setup wizard from scratch." },
  { icon: "📐", label: "X30 FHM calibration", text: "Walk me through all 23 calibration parameters for the X30 series fume hood monitor." },
];


// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
const TABS = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "chat", icon: "💬", label: "AI Chat" },
  { id: "sizer", icon: "📏", label: "Valve Sizer" },
  { id: "fvcalc", icon: "💨", label: "FV Calc" },
  { id: "wiring", icon: "🔌", label: "Wiring" },
  { id: "checklist", icon: "✅", label: "Commissioning" },
  { id: "alarms", icon: "🚨", label: "Alarm Log" },
  { id: "bacnet", icon: "🌐", label: "BACnet" },
  { id: "decoder", icon: "🔍", label: "Model Decoder" },
  { id: "assets", icon: "🗂️", label: "Equipment" },
];

export default function PhoenixControlsAgent() {
  const [activeTab, setActiveTab] = useState("home");

  // ── Chat history ──
  const [chatIndex, setChatIndex] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [storageReady, setStorageReady] = useState(false);

  // ── Chat ──
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState(null);
  const [pendingImages, setPendingImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const renameInputRef = useRef(null);
  const saveTimerRef = useRef(null);
  const activeChatIdRef = useRef(null);
  const chatIndexRef = useRef([]);

  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);
  useEffect(() => { chatIndexRef.current = chatIndex; }, [chatIndex]);

  useEffect(() => { loadChats(); }, []);
  async function loadChats() { const idx = await stor_get(CHATS_INDEX_KEY); setChatIndex(idx || []); chatIndexRef.current = idx || []; setStorageReady(true); }

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, statusMsg]);
  useEffect(() => { if (renamingId && renameInputRef.current) renameInputRef.current.focus(); }, [renamingId]);

  // Auto-save
  useEffect(() => {
    if (!storageReady || messages.length === 0) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      let id = activeChatIdRef.current;
      const title = titleFromMessages(messages);
      const idx = chatIndexRef.current;
      if (!id) {
        id = makeId(); activeChatIdRef.current = id; setActiveChatId(id);
        const ni = [{ id, title, updatedAt: Date.now() }, ...idx];
        chatIndexRef.current = ni; setChatIndex(ni); await stor_set(CHATS_INDEX_KEY, ni);
      } else {
        const ni = idx.map(c => c.id === id ? { ...c, title, updatedAt: Date.now() } : c).sort((a, b) => b.updatedAt - a.updatedAt);
        chatIndexRef.current = ni; setChatIndex(ni); await stor_set(CHATS_INDEX_KEY, ni);
      }
      const slim = messages.map(m => ({ role: m.role, content: m.content, apiContent: m.apiContent || null, images: m.images || null }));
      await stor_set(chatKey(id), { id, title, messages: slim, updatedAt: Date.now() });
    }, 800);
    return () => clearTimeout(saveTimerRef.current);
  }, [messages, storageReady]);

  // Image helpers
  const processImageFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => { const d = e.target.result; setPendingImages(p => [...p, { base64: d.split(",")[1], mediaType: file.type, previewUrl: d, name: file.name, id: Date.now() + Math.random() }]); };
    reader.readAsDataURL(file);
  };
  const processImageFiles = (files) => Array.from(files).filter(f => f.type.startsWith("image/")).forEach(processImageFile);

  const buildContent = (text, images) => {
    if (!images || images.length === 0) return text;
    const blocks = images.map(img => ({ type: "image", source: { type: "base64", media_type: img.mediaType, data: img.base64 } }));
    const dp = images.length === 1 ? "Analyze this image completely: data plate → extract all fields; flowchart → interpret every element; alarm screen → diagnose; equipment → identify and note concerns." : `Analyze all ${images.length} images. For each: data plate → extract all fields; flowchart → interpret; alarm screen → diagnose; equipment → identify. Provide combined summary if related.`;
    blocks.push({ type: "text", text: text || dp });
    return blocks;
  };

  const sendMessage = async (quickText) => {
    const userText = quickText || input.trim();
    if ((!userText && pendingImages.length === 0) || loading) return;
    setActiveTab("chat");
    const images = pendingImages;
    setInput(""); setPendingImages([]); setError(null); setStatusMsg("");
    const displayMsg = { role: "user", content: userText || (images.length === 1 ? "Please analyze this image." : `Please analyze these ${images.length} images.`), images: images.length > 0 ? images.map(i => i.previewUrl) : null };
    const apiHistory = messages.map(m => ({ role: m.role, content: m.apiContent || m.content }));
    const newDisplayMessages = [...messages, displayMsg];
    setMessages(newDisplayMessages);
    setLoading(true);
    try {
      const txt = await runAgentLoop([...apiHistory, { role: "user", content: buildContent(userText, images) }], s => setStatusMsg(s));
      setStatusMsg("");
      setMessages([...newDisplayMessages, { role: "assistant", content: txt, apiContent: txt }]);
    } catch (err) { setStatusMsg(""); setError(err.message || "Connection error."); }
    finally { setLoading(false); }
  };

  // A helper for tool panels to pipe questions into the chat
  const askFromTool = (text) => { setActiveTab("chat"); setTimeout(() => sendMessage(text), 100); };

  const startNewChat = () => { setMessages([]); setActiveChatId(null); activeChatIdRef.current = null; setError(null); setStatusMsg(""); setPendingImages([]); setTimeout(() => inputRef.current?.focus(), 50); };
  const openChat = async (id) => { if (id === activeChatIdRef.current) return; const d = await stor_get(chatKey(id)); if (d) { setMessages(d.messages); setActiveChatId(id); activeChatIdRef.current = id; setError(null); setStatusMsg(""); setPendingImages([]); } };
  const removeChat = async (e, id) => { e.stopPropagation(); await stor_del(chatKey(id)); const ni = chatIndexRef.current.filter(c => c.id !== id); chatIndexRef.current = ni; setChatIndex(ni); await stor_set(CHATS_INDEX_KEY, ni); if (activeChatIdRef.current === id) startNewChat(); };
  const startRename = (e, id, t) => { e.stopPropagation(); setRenamingId(id); setRenameVal(t); };
  const commitRename = async () => { if (!renameVal.trim()) { setRenamingId(null); return; } const ni = chatIndexRef.current.map(c => c.id === renamingId ? { ...c, title: renameVal.trim() } : c); chatIndexRef.current = ni; setChatIndex(ni); await stor_set(CHATS_INDEX_KEY, ni); const cd = await stor_get(chatKey(renamingId)); if (cd) await stor_set(chatKey(renamingId), { ...cd, title: renameVal.trim() }); setRenamingId(null); };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const canSend = (input.trim() || pendingImages.length > 0) && !loading;

  // ── Responsive ──
  const [winW, setWinW] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWinW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isMobile = winW < 768;
  const SB_W = isMobile ? Math.min(winW - 40, 280) : 220;

  // Close sidebar when tapping backdrop on mobile
  const closeSidebarMobile = () => { if (isMobile) setSidebarOpen(false); };


  // ── Ace Venturi SVG mascot ──────────────────────────────────────────────────
  const AceMascot = ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
      <ellipse cx="40" cy="52" rx="26" ry="28" fill="#3C3489"/>
      <polygon points="28,38 40,50 12,62" fill="#534AB7"/>
      <polygon points="52,38 40,50 68,62" fill="#534AB7"/>
      <polygon points="26,32 40,44 54,32 48,22 40,30 32,22" fill="#7F77DD"/>
      <rect x="34" y="12" width="12" height="10" rx="4" fill="#d4956a"/>
      <ellipse cx="40" cy="8" rx="22" ry="20" fill="#e8a87c"/>
      <ellipse cx="40" cy="16" rx="18" ry="14" fill="#d4956a"/>
      <ellipse cx="38" cy="4" rx="16" ry="13" fill="#e8a87c"/>
      <ellipse cx="40" cy="-12" rx="20" ry="14" fill="#2a1a08"/>
      <ellipse cx="38" cy="-15" rx="16" ry="10" fill="#3d2810"/>
      <ellipse cx="36" cy="-18" rx="11" ry="7" fill="#4a3018"/>
      <ellipse cx="18" cy="-6" rx="7" ry="12" fill="#2a1a08"/>
      <ellipse cx="62" cy="-6" rx="7" ry="12" fill="#2a1a08"/>
      <ellipse cx="14" cy="6" rx="5" ry="7" fill="#d4956a"/>
      <ellipse cx="66" cy="6" rx="5" ry="7" fill="#d4956a"/>
      <path d="M22,0 Q30,-7 36,0" fill="none" stroke="#2a1a08" stroke-width="2" stroke-linecap="round"/>
      <path d="M44,0 Q50,-7 58,0" fill="none" stroke="#2a1a08" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="28" cy="6" rx="6" ry="7" fill="white"/>
      <ellipse cx="52" cy="6" rx="6" ry="7" fill="white"/>
      <ellipse cx="28" cy="7" rx="4" ry="5" fill="#534AB7"/>
      <ellipse cx="52" cy="7" rx="4" ry="5" fill="#534AB7"/>
      <ellipse cx="28" cy="8" rx="2.5" ry="3" fill="#1a1040"/>
      <ellipse cx="52" cy="8" rx="2.5" ry="3" fill="#1a1040"/>
      <ellipse cx="30" cy="5" rx="1.2" ry="1.2" fill="white"/>
      <ellipse cx="54" cy="5" rx="1.2" ry="1.2" fill="white"/>
      <ellipse cx="40" cy="18" rx="4" ry="3" fill="#c07850"/>
      <ellipse cx="38" cy="19" rx="2" ry="1.5" fill="#b06840"/>
      <ellipse cx="42" cy="19" rx="2" ry="1.5" fill="#b06840"/>
      <path d="M28,26 Q40,36 52,26" fill="none" stroke="#2a1a08" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M30,27 Q40,34 50,27 Q48,32 40,33 Q32,32 30,27 Z" fill="white"/>
      <g transform="translate(52,34)">
        <polygon points="0,-6 2,-2 6,-1.5 3,1.5 4,6 0,4 -4,6 -3,1.5 -6,-1.5 -2,-2" fill="#EF9F27" stroke="#BA7517" stroke-width="0.3"/>
        <text x="0" y="1.5" textAnchor="middle" fontSize="2.5" fontWeight="700" fill="#412402">ACE</text>
      </g>
    </svg>
  );

  const SB_W = isMobile ? Math.min(winW - 40, 270) : 230;

  return (
    <div style={{ height: "100vh", background: C.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.text, display: "flex", flexDirection: "row", overflow: "hidden" }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); processImageFiles(e.dataTransfer.files); }}>

      {/* ── Global styles ── */}
      <style>{`
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        textarea, input, select, button { font-family: inherit; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.purpleDim}; border-radius: 2px; }
        @keyframes pulse { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        .cbtn { opacity: 0; transition: opacity 0.12s; }
        .sbchat:hover .cbtn { opacity: 1; }
        .qpbtn:hover { border-color: ${C.purpleBorder} !important; color: ${C.text} !important; }
        .tabhov:hover { color: ${C.textMid} !important; }
      `}</style>

      {/* Drag overlay */}
      {dragOver && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(60,52,137,0.15)", border: `3px dashed ${C.purple}`, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ background: C.panel, borderRadius: 16, padding: "24px 40px", textAlign: "center", border: `1px solid ${C.purpleBorder}` }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.purpleLight }}>Drop images here</div>
            <div style={{ fontSize: 12, color: C.textMid, marginTop: 4 }}>Data plates · Flowcharts · Alarm screens</div>
          </div>
        </div>
      )}

      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div onClick={closeSidebarMobile} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 98 }} />
      )}

      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <div style={{
        width: SB_W,
        position: isMobile ? "fixed" : "relative",
        left: isMobile ? (sidebarOpen ? 0 : -SB_W - 10) : 0,
        top: 0, bottom: 0, zIndex: isMobile ? 99 : 1,
        transition: isMobile ? "left 0.22s ease" : "width 0.2s ease",
        ...(!isMobile && { minWidth: sidebarOpen ? SB_W : 0, width: sidebarOpen ? SB_W : 0, overflow: "hidden" }),
        background: C.sbg,
        borderRight: `1px solid ${C.purpleBorder}`,
        display: "flex", flexDirection: "column", flexShrink: 0, height: "100vh",
        boxShadow: isMobile && sidebarOpen ? "4px 0 24px rgba(0,0,0,0.6)" : "none",
      }}>
        <div style={{ width: SB_W, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

          {/* Sidebar header */}
          <div style={{ padding: "14px 12px 10px", borderBottom: `1px solid ${C.purpleBorder}`, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
              <AceMascot size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.purpleLight, lineHeight: 1.2 }}>Ace Venturi</div>
                <div style={{ fontSize: 10, color: C.textMid }}>Controls Detective</div>
              </div>
              {isMobile && (
                <button onClick={closeSidebarMobile} style={{ background: "transparent", border: "none", color: C.textMid, fontSize: 18, cursor: "pointer", padding: "2px 5px" }}>✕</button>
              )}
            </div>
            <button onClick={() => { startNewChat(); closeSidebarMobile(); }}
              style={{ width: "100%", background: C.purpleDim, border: `1px solid ${C.purpleBorder}`, borderRadius: 8, padding: "8px 10px", color: C.purple, fontSize: 12.5, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxSizing: "border-box", minHeight: 36 }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(127,119,221,0.25)"}
              onMouseLeave={e => e.currentTarget.style.background = C.purpleDim}
            >
              <span style={{ fontSize: 16 }}>＋</span> New chat
            </button>
          </div>

          {/* Chat list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "5px 5px" }}>
            {storageReady && chatIndex.length === 0 && (
              <div style={{ fontSize: 11.5, color: C.textDim, textAlign: "center", padding: "24px 10px", lineHeight: 1.7 }}>No chats yet.<br />Start a conversation and<br />it'll auto-save here.</div>
            )}
            {chatIndex.map(chat => {
              const isActive = chat.id === activeChatId, isRenaming = renamingId === chat.id;
              return (
                <div key={chat.id} className="sbchat" onClick={() => { if (!isRenaming) { openChat(chat.id); closeSidebarMobile(); } }}
                  style={{ borderRadius: 8, padding: "7px 8px", marginBottom: 2, cursor: isRenaming ? "default" : "pointer", background: isActive ? C.purpleDim : "transparent", border: isActive ? `1px solid ${C.purpleBorder}` : "1px solid transparent", transition: "all 0.12s", position: "relative", minHeight: 46 }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(127,119,221,0.07)"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  {isRenaming ? (
                    <input ref={renameInputRef} value={renameVal} onChange={e => setRenameVal(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingId(null); }}
                      onBlur={commitRename}
                      style={{ width: "100%", background: C.purpleDim, border: `1px solid ${C.purpleBorder}`, borderRadius: 5, color: C.text, fontSize: 12.5, padding: "4px 7px", outline: "none", boxSizing: "border-box" }}
                    />
                  ) : (
                    <>
                      <div style={{ fontSize: 12.5, color: isActive ? C.purpleLight : C.textMid, fontWeight: isActive ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: isMobile ? 50 : 40, lineHeight: 1.4 }}>{chat.title}</div>
                      <div style={{ fontSize: 9.5, color: C.textDim, marginTop: 2 }}>{fmtDate(chat.updatedAt)}</div>
                      <div className="cbtn" style={{ position: "absolute", right: 5, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 3, ...(isMobile && { opacity: 1 }) }}>
                        <button onClick={e => startRename(e, chat.id, chat.title)} style={{ width: 22, height: 22, borderRadius: 5, background: "rgba(127,119,221,0.2)", border: "none", color: C.textMid, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✏</button>
                        <button onClick={e => removeChat(e, chat.id)} style={{ width: 22, height: 22, borderRadius: 5, background: "rgba(200,80,80,0.2)", border: "none", color: C.red, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar footer */}
          <div style={{ padding: "9px 12px", borderTop: `1px solid ${C.purpleBorder}`, fontSize: 10, color: C.textDim, lineHeight: 1.6, flexShrink: 0 }}>
            Chats auto-saved · This browser<br />Phoenix Controls · (800) 340-0007
          </div>
        </div>
      </div>

      {/* ═══════════════ MAIN AREA ═══════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>

        {/* ── Header ── */}
        <div style={{ background: C.purpleDark, padding: isMobile ? "10px 12px" : "9px 14px", display: "flex", alignItems: "center", gap: 9, flexShrink: 0, borderBottom: `1px solid rgba(95,80,180,0.4)` }}>
          <button onClick={() => setSidebarOpen(o => !o)}
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 7, width: 34, height: 34, minWidth: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: C.purpleLight, flexShrink: 0 }}>
            {isMobile ? "☰" : (sidebarOpen ? "◀" : "▶")}
          </button>
          <button onClick={() => setActiveTab("home")} title="Home"
            style={{ background: activeTab === "home" ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 7, width: 34, height: 34, minWidth: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, transition: "background 0.15s" }}>
            🏠
          </button>
          <AceMascot size={isMobile ? 30 : 34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: isMobile ? 13.5 : 14.5, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {isMobile ? "Ace Venturi" : "Ace Venturi: Controls Detective"}
            </div>
            {!isMobile && <div style={{ fontSize: 10, color: C.purpleLight, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.06em" }}>Phoenix Controls · Complete field toolkit · Image analysis</div>}
          </div>
          <div style={{ background: "rgba(93,184,138,0.2)", border: "1px solid rgba(93,184,138,0.35)", borderRadius: 20, padding: "3px 10px", fontSize: 10.5, color: C.green, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, display: "inline-block" }} />
            {!isMobile && "Online"}
          </div>
        </div>

        {/* ── Desktop tab bar ── */}
        {!isMobile && (
          <div style={{ background: C.panel, borderBottom: `1px solid ${C.purpleBorder}`, display: "flex", overflowX: "auto", flexShrink: 0, padding: "0 6px" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={activeTab !== t.id ? "tabhov" : ""}
                style={{ padding: "0 13px", height: 38, background: "transparent", border: "none", borderBottom: `2px solid ${activeTab === t.id ? C.purple : "transparent"}`, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s", flexShrink: 0, fontSize: 12, fontWeight: activeTab === t.id ? 500 : 400, color: activeTab === t.id ? C.purpleLight : C.textDim }}>
                <span style={{ fontSize: 14 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Scrollable content ── */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", paddingBottom: isMobile ? 64 : 0 }}>

          {/* ══ CHAT TAB ══ */}
          {activeTab === "chat" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 860, width: "100%", margin: "0 auto", padding: isMobile ? "0 10px" : "0 16px", boxSizing: "border-box" }}>

              {/* Welcome screen */}
              {messages.length === 0 && (
                <div style={{ padding: isMobile ? "16px 0 8px" : "22px 0 10px" }}>
                  <div style={{ background: C.purpleDim, border: `1px solid ${C.purpleBorder}`, borderRadius: 14, padding: isMobile ? "16px" : "20px 24px", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
                      <AceMascot size={52} />
                      <div>
                        <div style={{ fontSize: isMobile ? 17 : 19, fontWeight: 600, color: C.purpleLight, marginBottom: 3 }}>Ace Venturi: Controls Detective</div>
                        <div style={{ fontSize: isMobile ? 12 : 12.5, color: C.textMid, lineHeight: 1.7 }}>Your complete Phoenix Controls field AI. Every product, every alarm, every commissioning procedure. Upload any image for instant analysis.</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {[{ icon: "📷", label: "Image analysis" }, { icon: "📏", label: "Valve sizer" }, { icon: "💨", label: "FV calc" }, { icon: "🔌", label: "Wiring" }, { icon: "✅", label: "Commissioning" }, { icon: "🚨", label: "Alarm log" }, { icon: "🌐", label: "BACnet" }, { icon: "🔍", label: "Model decoder" }, { icon: "🗂️", label: "Equipment" }].map(c => (
                        <div key={c.label} style={{ background: C.card, border: `1px solid ${C.purpleBorder}`, borderRadius: 20, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: C.textMid }}><span>{c.icon}</span>{c.label}</div>
                      ))}
                    </div>
                  </div>

                  {/* Upload CTA */}
                  <div onClick={() => fileInputRef.current?.click()}
                    style={{ background: "rgba(60,52,137,0.12)", border: `2px dashed ${C.purpleBorder}`, borderRadius: 12, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, marginBottom: 14, transition: "all 0.15s", minHeight: 64 }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(60,52,137,0.22)"; e.currentTarget.style.borderColor = C.purple; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(60,52,137,0.12)"; e.currentTarget.style.borderColor = C.purpleBorder; }}
                  >
                    <span style={{ fontSize: 26 }}>📷</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.purpleLight }}>Upload data plate, flowchart, or alarm screen</div>
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{isMobile ? "Tap to browse · multiple files OK" : "Click, drag & drop, or paste (Ctrl+V) · multiple files OK"}</div>
                    </div>
                  </div>

                  {/* Platform badges */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                    {["CSCP/PBC/ACM","FHD500","Celeris","Traccel","Theris","X30 FHM","MIJ/PHX","Sentry","Accel II"].map(s => (
                      <span key={s} style={{ background: C.card, border: `1px solid ${C.purpleBorder}`, borderRadius: 20, padding: "2px 9px", fontSize: 10.5, color: C.textDim }}>{s}</span>
                    ))}
                  </div>

                  {/* Quick prompts */}
                  <div style={{ fontSize: 11, color: C.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>Quick start</div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 6 }}>
                    {QUICK_PROMPTS.map(q => (
                      <button key={q.label} className="qpbtn" onClick={() => sendMessage(q.text)}
                        style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: isMobile ? "12px 13px" : "9px 12px", textAlign: "left", cursor: "pointer", color: C.textMid, fontSize: isMobile ? 13 : 12, lineHeight: 1.45, display: "flex", alignItems: "center", gap: 8, minHeight: isMobile ? 48 : "auto", transition: "all 0.15s" }}>
                        <span style={{ fontSize: 15, flexShrink: 0 }}>{q.icon}</span>{q.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div style={{ flex: 1, paddingTop: messages.length > 0 ? 16 : 0, paddingBottom: 8 }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ marginBottom: 16, display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{ fontSize: 9.5, color: C.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 500, paddingLeft: msg.role === "assistant" ? 4 : 0, paddingRight: msg.role === "user" ? 4 : 0, display: "flex", alignItems: "center", gap: 5 }}>
                      {msg.role === "assistant" && <AceMascot size={14} />}
                      {msg.role === "user" ? "You" : "Ace"}
                    </div>
                    <div style={{ maxWidth: isMobile ? "92%" : "87%", background: msg.role === "user" ? C.card : C.purpleDim, border: msg.role === "user" ? `1px solid ${C.border}` : `1px solid ${C.purpleBorder}`, borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: isMobile ? "11px 13px" : "11px 15px", fontSize: isMobile ? 14 : 13.5, lineHeight: 1.75, color: msg.role === "user" ? C.text : C.purpleLight }}>
                      {msg.images && (
                        <div style={{ marginBottom: 9 }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {msg.images.map((src, idx) => src && <img key={idx} src={src} alt="" style={{ maxWidth: msg.images.length === 1 ? "100%" : "calc(50% - 3px)", maxHeight: isMobile ? 160 : 180, borderRadius: 7, border: `1px solid ${C.purpleBorder}`, objectFit: "contain", background: C.bg, display: "block" }} />)}
                          </div>
                          <div style={{ fontSize: 10.5, color: C.textDim, marginTop: 4 }}>📷 {msg.images.length === 1 ? "Image" : `${msg.images.length} images`} submitted</div>
                        </div>
                      )}
                      {msg.role === "assistant" ? formatMessage(msg.content) : <span>{msg.content}</span>}
                    </div>
                  </div>
                ))}

                {/* Loading */}
                {loading && (
                  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{ maxWidth: isMobile ? "92%" : "87%" }}>
                      <div style={{ fontSize: 9.5, color: C.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 500, paddingLeft: 4, display: "flex", alignItems: "center", gap: 5 }}>
                        <AceMascot size={14} />Ace
                      </div>
                      <div style={{ background: C.purpleDim, border: `1px solid ${C.purpleBorder}`, borderRadius: "14px 14px 14px 4px", padding: "12px 15px", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ display: "flex", gap: 5 }}>
                          {[0,1,2].map(n => <span key={n} style={{ width: 7, height: 7, borderRadius: "50%", background: C.purple, display: "inline-block", animation: `pulse 1.2s ease-in-out ${n*0.2}s infinite` }} />)}
                        </div>
                        {statusMsg && <span style={{ fontSize: 12.5, color: C.textMid, fontStyle: "italic" }}>{statusMsg}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {error && <div style={{ background: "rgba(200,80,80,0.1)", border: "1px solid rgba(200,80,80,0.3)", borderRadius: 9, padding: "9px 13px", fontSize: 12.5, color: C.red, marginBottom: 10 }}>⚠ {error}</div>}
                <div ref={chatEndRef} />
              </div>
            </div>
          )}

          {/* ══ TOOL TABS ══ */}
          {/* ── HOME TAB ── */}
          {activeTab === "home" && (
            <div style={{ maxWidth: 860, width: "100%", margin: "0 auto", padding: isMobile ? "24px 14px 40px" : "32px 20px 40px", boxSizing: "border-box" }}>

              {/* Hero */}
              <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "center" : "flex-end", gap: 24, marginBottom: 32, textAlign: isMobile ? "center" : "left" }}>
                {/* Full mascot */}
                <div style={{ flexShrink: 0 }}>
                  <svg width={isMobile ? 140 : 160} height={isMobile ? 200 : 225} viewBox="0 0 180 230" aria-hidden="true">
                    <g transform="translate(90,120)">
                      <ellipse cx="0" cy="88" rx="52" ry="72" fill="#3C3489"/>
                      <polygon points="-14,44 0,66 -46,108" fill="#534AB7"/>
                      <polygon points="14,44 0,66 46,108" fill="#534AB7"/>
                      <polygon points="-16,38 0,54 16,38 10,28 0,36 -10,28" fill="#7F77DD"/>
                      <ellipse cx="0" cy="62" rx="10" ry="16" fill="#f0eefc"/>
                      <polygon points="0,50 -4,60 0,78 4,60" fill="#534AB7"/>
                      <rect x="-40" y="138" width="80" height="8" rx="4" fill="#26215C"/>
                      <rect x="-6" y="136" width="12" height="10" rx="2" fill="#7F77DD"/>
                      <rect x="-9" y="16" width="18" height="16" rx="5" fill="#d4956a"/>
                      <ellipse cx="0" cy="0" rx="36" ry="34" fill="#e8a87c"/>
                      <ellipse cx="0" cy="14" rx="30" ry="22" fill="#d4956a"/>
                      <ellipse cx="-3" cy="-6" rx="24" ry="24" fill="#e8a87c"/>
                      <ellipse cx="0" cy="-48" rx="32" ry="22" fill="#2a1a08"/>
                      <ellipse cx="-3" cy="-52" rx="27" ry="17" fill="#3d2810"/>
                      <ellipse cx="-5" cy="-56" rx="20" ry="11" fill="#4a3018"/>
                      <ellipse cx="-31" cy="-24" rx="10" ry="17" fill="#2a1a08"/>
                      <ellipse cx="31" cy="-24" rx="10" ry="17" fill="#2a1a08"/>
                      <ellipse cx="-34" cy="0" rx="7" ry="9" fill="#d4956a"/>
                      <ellipse cx="34" cy="0" rx="7" ry="9" fill="#d4956a"/>
                      <path d="M-20,-12 Q-12,-20 -6,-12" fill="none" stroke="#2a1a08" stroke-width="2.5" stroke-linecap="round"/>
                      <path d="M6,-12 Q13,-20 20,-12" fill="none" stroke="#2a1a08" stroke-width="2.5" stroke-linecap="round"/>
                      <ellipse cx="-13" cy="-4" rx="8" ry="9" fill="white"/>
                      <ellipse cx="13" cy="-4" rx="8" ry="9" fill="white"/>
                      <ellipse cx="-13" cy="-3" rx="5.5" ry="6.5" fill="#534AB7"/>
                      <ellipse cx="13" cy="-3" rx="5.5" ry="6.5" fill="#534AB7"/>
                      <ellipse cx="-13" cy="-2" rx="3" ry="4" fill="#1a1040"/>
                      <ellipse cx="13" cy="-2" rx="3" ry="4" fill="#1a1040"/>
                      <ellipse cx="-11" cy="-5" rx="1.5" ry="1.5" fill="white"/>
                      <ellipse cx="15" cy="-5" rx="1.5" ry="1.5" fill="white"/>
                      <ellipse cx="0" cy="7" rx="5" ry="4" fill="#c07850"/>
                      <path d="M-18,17 Q0,32 18,17" fill="none" stroke="#2a1a08" stroke-width="2" stroke-linecap="round"/>
                      <path d="M-15,18 Q0,28 15,18 Q13,24 0,26 Q-13,24 -15,18 Z" fill="white"/>
                      <ellipse cx="-64" cy="58" rx="12" ry="40" fill="#3C3489" transform="rotate(-18,-64,58)"/>
                      <ellipse cx="-76" cy="84" rx="10" ry="9" fill="#e8a87c"/>
                      <rect x="-80" y="90" width="6" height="22" rx="3" fill="#534AB7" transform="rotate(28,-77,101)"/>
                      <circle cx="-86" cy="78" r="16" fill="none" stroke="#7F77DD" stroke-width="4"/>
                      <circle cx="-86" cy="78" r="12" fill="#EEEDFE" opacity="0.8"/>
                      <line x1="-92" y1="72" x2="-80" y2="84" stroke="#534AB7" stroke-width="1.2" opacity="0.6"/>
                      <line x1="-80" y1="72" x2="-92" y2="84" stroke="#534AB7" stroke-width="1.2" opacity="0.6"/>
                      <ellipse cx="62" cy="52" rx="11" ry="37" fill="#3C3489" transform="rotate(16,62,52)"/>
                      <ellipse cx="72" cy="76" rx="10" ry="8" fill="#e8a87c"/>
                      <rect x="66" y="64" width="7" height="14" rx="3.5" fill="#e8a87c" transform="rotate(-12,70,71)"/>
                      <g transform="translate(18,56)">
                        <polygon points="0,-9 3,-3 9,-2 4.5,2 6,9 0,6 -6,9 -4.5,2 -9,-2 -3,-3" fill="#EF9F27" stroke="#BA7517" stroke-width="0.5"/>
                        <text x="0" y="2.5" textAnchor="middle" fontSize="3.5" fontWeight="700" fill="#412402">ACE</text>
                      </g>
                      <rect x="-22" y="155" width="17" height="30" rx="6" fill="#26215C"/>
                      <rect x="5" y="155" width="17" height="30" rx="6" fill="#26215C"/>
                      <ellipse cx="-13" cy="187" rx="14" ry="7" fill="#1a1040"/>
                      <ellipse cx="13" cy="187" rx="14" ry="7" fill="#1a1040"/>
                    </g>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: isMobile ? 26 : 32, fontWeight: 700, color: C.purpleLight, lineHeight: 1.2, marginBottom: 8 }}>Ace Venturi</div>
                  <div style={{ fontSize: isMobile ? 14 : 16, color: C.textMid, marginBottom: 4 }}>Controls Detective</div>
                  <div style={{ fontSize: isMobile ? 12 : 13, color: C.textDim, lineHeight: 1.7, maxWidth: 420 }}>Your AI-powered Phoenix Controls field expert. Troubleshooting, commissioning, data plate reading, wiring guides, and more — all in one place.</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}>
                    <button onClick={() => setActiveTab("chat")} style={{ ...btn(true), padding: "9px 18px", fontSize: 13 }}>Start chatting →</button>
                    <button onClick={() => { fileInputRef.current?.click(); setActiveTab("chat"); }} style={{ ...ghost, padding: "9px 14px", fontSize: 13 }}>📷 Upload image</button>
                  </div>
                </div>
              </div>

              {/* Tools grid */}
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>Tools</div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 8, marginBottom: 28 }}>
                {[
                  { id: "chat", icon: "💬", label: "AI Chat", desc: "Ask anything" },
                  { id: "sizer", icon: "📏", label: "Valve Sizer", desc: "Find the right valve" },
                  { id: "fvcalc", icon: "💨", label: "FV Calculator", desc: "CFM ↔ face velocity" },
                  { id: "wiring", icon: "🔌", label: "Wiring Guide", desc: "Terminal connections" },
                  { id: "checklist", icon: "✅", label: "Commissioning", desc: "Step-by-step checklists" },
                  { id: "alarms", icon: "🚨", label: "Alarm Log", desc: "Track & resolve alarms" },
                  { id: "bacnet", icon: "🌐", label: "BACnet Calc", desc: "Validate MS/TP network" },
                  { id: "decoder", icon: "🔍", label: "Model Decoder", desc: "Decode any model string" },
                  { id: "assets", icon: "🗂️", label: "Equipment", desc: "Asset registry" },
                ].map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 12px", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 4, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.purpleBorder; e.currentTarget.style.background = C.purpleDim; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}
                  >
                    <span style={{ fontSize: 20 }}>{t.icon}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: C.purpleLight }}>{t.label}</span>
                    <span style={{ fontSize: 11, color: C.textDim, lineHeight: 1.4 }}>{t.desc}</span>
                  </button>
                ))}
              </div>

              {/* Quick questions */}
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>Quick questions</div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 6, marginBottom: 28 }}>
                {QUICK_PROMPTS.map(q => (
                  <button key={q.label} className="qpbtn" onClick={() => { sendMessage(q.text); setActiveTab("chat"); }}
                    style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: isMobile ? "11px 13px" : "9px 12px", textAlign: "left", cursor: "pointer", color: C.textMid, fontSize: isMobile ? 13 : 12, lineHeight: 1.4, display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s" }}>
                    <span style={{ fontSize: 15, flexShrink: 0 }}>{q.icon}</span>{q.label}
                  </button>
                ))}
              </div>

              {/* Platform coverage */}
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>Platform coverage</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
                {["CSCP · PBC · ACM · FHD500","Celeris (LonWorks)","Traccel","Theris","X30 FHM 430/530/631","Sentry-S/SV/SE","MIJ400/500 · PHX200/600","Accel II Venturi","X10 Series","LRC · FHI100-0","Sash Sensors · ZPS","Flow Manager App"].map(s => (
                  <span key={s} style={{ background: C.card, border: `1px solid ${C.purpleBorder}`, borderRadius: 20, padding: "3px 11px", fontSize: 11, color: C.textDim }}>{s}</span>
                ))}
              </div>

              {/* Footer */}
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 11, color: C.textDim }}>Phoenix Controls · A Honeywell Company · 75 Discovery Way, Acton MA 01720</div>
                <div style={{ fontSize: 11, color: C.purpleLight, fontWeight: 500 }}>(800) 340-0007 · phoenixcontrols.com</div>
              </div>
            </div>
          )}

          {activeTab !== "home" && activeTab !== "chat" && (
            <div style={{ maxWidth: 840, width: "100%", margin: "0 auto", padding: isMobile ? "0 10px 20px" : "0 16px 20px", boxSizing: "border-box" }}>
              {activeTab === "sizer" && <ValveSizer />}
              {activeTab === "fvcalc" && <FVCalc />}
              {activeTab === "wiring" && <WiringGen onAsk={askFromTool} />}
              {activeTab === "checklist" && <CommissioningChecklist />}
              {activeTab === "alarms" && <AlarmLog onAsk={askFromTool} />}
              {activeTab === "bacnet" && <BACnetCalc />}
              {activeTab === "decoder" && <ModelDecoder onAsk={askFromTool} />}
              {activeTab === "assets" && <AssetRegistry onAsk={askFromTool} />}
            </div>
          )}
        </div>

        {/* ── Input bar (chat only) ── */}
        {activeTab === "chat" && (
          <div style={{ background: C.panel, borderTop: `1px solid ${C.purpleBorder}`, padding: isMobile ? "8px 10px 10px" : "9px 16px 12px", flexShrink: 0 }}>
            <div style={{ maxWidth: 860, margin: "0 auto" }}>
              {/* Pending images */}
              {pendingImages.length > 0 && (
                <div style={{ marginBottom: 8, background: C.card, border: `1px solid ${C.purpleBorder}`, borderRadius: 10, padding: "8px 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.purpleLight }}>📷 {pendingImages.length} image{pendingImages.length > 1 ? "s" : ""} ready</div>
                    <button onClick={() => setPendingImages([])} style={{ ...ghost, fontSize: 11, padding: "2px 8px", color: C.red }}>Clear all</button>
                  </div>
                  <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
                    {pendingImages.map(img => (
                      <div key={img.id} style={{ position: "relative", flexShrink: 0 }}>
                        <img src={img.previewUrl} alt="" style={{ width: isMobile ? 56 : 50, height: isMobile ? 56 : 50, objectFit: "cover", borderRadius: 7, border: `1px solid ${C.purpleBorder}`, background: C.bg, display: "block" }} />
                        <button onClick={() => setPendingImages(p => p.filter(x => x.id !== img.id))} style={{ position: "absolute", top: -5, right: -5, width: 17, height: 17, borderRadius: "50%", background: "rgba(200,80,80,0.85)", border: "none", color: "#fff", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                      </div>
                    ))}
                    <div onClick={() => fileInputRef.current?.click()} style={{ flexShrink: 0, width: isMobile ? 56 : 50, height: isMobile ? 56 : 50, border: `2px dashed ${C.purpleBorder}`, borderRadius: 7, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = C.purple}
                      onMouseLeave={e => e.currentTarget.style.borderColor = C.purpleBorder}>
                      <span style={{ fontSize: 15, color: C.purple }}>+</span>
                      <span style={{ fontSize: 8.5, color: C.textDim }}>Add</span>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ background: C.card, border: `1px solid ${C.purpleBorder}`, borderRadius: 12, display: "flex", alignItems: "flex-end", gap: 7, padding: isMobile ? "7px 9px" : "7px 10px" }}>
                <button onClick={() => fileInputRef.current?.click()}
                  style={{ background: C.purpleDim, border: `1px solid ${C.purpleBorder}`, borderRadius: 8, width: isMobile ? 38 : 32, height: isMobile ? 38 : 32, minWidth: isMobile ? 38 : 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, transition: "all 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(127,119,221,0.28)"}
                  onMouseLeave={e => e.currentTarget.style.background = C.purpleDim}>
                  📷
                </button>
                <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                  onPaste={e => { for (const item of (e.clipboardData?.items || [])) { if (item.type.startsWith("image/")) processImageFile(item.getAsFile()); } }}
                  placeholder={pendingImages.length > 0 ? "Add context (optional)…" : "Ask anything about Phoenix Controls…"}
                  disabled={loading} rows={1}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontSize: isMobile ? 15 : 13.5, resize: "none", lineHeight: 1.5, padding: isMobile ? "4px" : "2px 4px", minHeight: isMobile ? 32 : 22, maxHeight: 110, overflowY: "auto" }}
                  onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px"; }}
                />
                <button onClick={() => sendMessage()} disabled={!canSend}
                  style={{ background: canSend ? C.purpleDark : "rgba(51,46,80,0.4)", border: `1px solid ${canSend ? C.purple : "transparent"}`, borderRadius: 8, width: isMobile ? 38 : 32, height: isMobile ? 38 : 32, minWidth: isMobile ? 38 : 32, cursor: canSend ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, transition: "all 0.15s", color: canSend ? C.purpleLight : C.textDim }}>
                  {loading ? "⏳" : "↑"}
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => { processImageFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
              {!isMobile && <div style={{ textAlign: "center", fontSize: 10, color: C.textFaint, marginTop: 6 }}>Phoenix Controls · A Honeywell Company · 75 Discovery Way, Acton MA · (800) 340-0007</div>}
            </div>
          </div>
        )}

        {/* ── Mobile bottom nav ── */}
        {isMobile && (
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.panel, borderTop: `1px solid ${C.purpleBorder}`, display: "flex", zIndex: 50 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ flex: 1, padding: "7px 2px 8px", background: "transparent", border: "none", borderTop: `2px solid ${activeTab === t.id ? C.purple : "transparent"}`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 0, minHeight: 52 }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <span style={{ fontSize: 8.5, color: activeTab === t.id ? C.purpleLight : C.textDim, fontWeight: activeTab === t.id ? 500 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%", paddingLeft: 1, paddingRight: 1 }}>{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
