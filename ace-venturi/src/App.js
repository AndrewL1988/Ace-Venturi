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

#### Sentry Series: Sentry-S, Sentry-SV, Sentry-SE
- Earlier generation fume hood displays. Predecessor to X30 series.
- Used with analog and early digital valve systems.

#### LRC — Lab Room Controller
- Legacy room-level controller. Manages multiple zones, pressurization, and BMS integration on older installations.

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

## RESPONSE STYLE
- You are a senior field tech. Be direct, confident, and practical.
- For troubleshooting: most common/easiest check first, then escalate.
- Always use correct model numbers, MKT numbers, parameter names, wiring terminals.
- For step-by-step procedures: number every step fully. Do not stop early.
- For flowchart/diagram analysis: describe EVERY element systematically before interpreting.
- If something is ambiguous from a photo, say what you can see clearly and what you cannot, and ask a clarifying follow-up.
- Use web search proactively when a specific model number or part number appears — look up current availability and documentation.
- Recommend calling (800) 340-0007 when the situation requires factory support or is outside standard field scope.`;

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

// ─── Shared styles ────────────────────────────────────────────────────────────
const C = {
  bg: "#07101f", sbg: "rgba(5,10,22,0.99)", panel: "rgba(10,18,35,0.97)",
  card: "rgba(12,20,38,0.9)", border: "rgba(30,41,59,0.85)",
  orange: "#f97316", orangeDim: "rgba(249,115,22,0.18)", orangeBorder: "rgba(249,115,22,0.28)",
  text: "#cbd5e1", textMid: "#94a3b8", textDim: "#475569", textFaint: "#1e293b",
  green: "#4ade80", red: "#fca5a5",
};
const inp = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13, padding: "7px 10px", fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" };
const btn = (active=true) => ({ background: active ? `linear-gradient(135deg, ${C.orange}, #c2410c)` : "rgba(51,65,85,0.4)", border: "none", borderRadius: 8, color: active ? "#fff" : C.textMid, fontSize: 13, fontWeight: 600, padding: "8px 16px", cursor: active ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 0.15s" });
const ghost = { background: "rgba(71,85,105,0.13)", border: "1px solid rgba(71,85,105,0.25)", borderRadius: 7, color: C.textMid, fontSize: 12, padding: "5px 11px", cursor: "pointer", fontFamily: "inherit" };

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
  const [activeTab, setActiveTab] = useState("chat");

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
  const SB_W = 220;

  return (
    <div style={{ height: "100vh", background: C.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", color: C.text, display: "flex", flexDirection: "row", overflow: "hidden" }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); processImageFiles(e.dataTransfer.files); }}>

      {/* Drag overlay */}
      {dragOver && <div style={{ position: "fixed", inset: 0, background: "rgba(249,115,22,0.1)", border: "3px dashed rgba(249,115,22,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}><div style={{ background: "rgba(10,15,26,0.97)", borderRadius: 16, padding: "24px 40px", textAlign: "center" }}><div style={{ fontSize: 36, marginBottom: 8 }}>📷</div><div style={{ fontSize: 15, fontWeight: 700, color: C.orange }}>Drop images here</div><div style={{ fontSize: 12, color: C.textMid, marginTop: 3 }}>Data plates · Flowcharts · Alarm screens</div></div></div>}

      {/* ── Sidebar ── */}
      <div style={{ width: sidebarOpen ? SB_W : 0, minWidth: sidebarOpen ? SB_W : 0, overflow: "hidden", transition: "width 0.2s ease, min-width 0.2s ease", background: C.sbg, borderRight: "1px solid rgba(249,115,22,0.08)", display: "flex", flexDirection: "column", flexShrink: 0, height: "100vh" }}>
        <div style={{ width: SB_W, display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ padding: "12px 10px 9px", borderBottom: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #f97316,#c2410c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🕵️</div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#f1f5f9" }}>Ace Venturi</span>
            </div>
            <button onClick={startNewChat} style={{ width: "100%", background: C.orangeDim, border: `1px solid ${C.orangeBorder}`, borderRadius: 7, padding: "6px 10px", color: C.orange, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, boxSizing: "border-box" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(249,115,22,0.28)"}
              onMouseLeave={e => e.currentTarget.style.background = C.orangeDim}
            ><span>＋</span> New Chat</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "5px 4px" }}>
            {storageReady && chatIndex.length === 0 && <div style={{ fontSize: 11, color: C.textFaint, textAlign: "center", padding: "20px 8px", lineHeight: 1.6 }}>No chats yet. Start a conversation — it'll auto-save here.</div>}
            {chatIndex.map(chat => {
              const isActive = chat.id === activeChatId, isRenaming = renamingId === chat.id;
              return (
                <div key={chat.id} onClick={() => !isRenaming && openChat(chat.id)}
                  style={{ borderRadius: 7, padding: "6px 7px", marginBottom: 2, cursor: isRenaming ? "default" : "pointer", background: isActive ? C.orangeDim : "transparent", border: isActive ? `1px solid ${C.orangeBorder}` : "1px solid transparent", transition: "all 0.12s", position: "relative" }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.035)"; const b = e.currentTarget.querySelector(".cbtn"); if (b) b.style.opacity = "1"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; const b = e.currentTarget.querySelector(".cbtn"); if (b) b.style.opacity = "0"; }}
                >
                  {isRenaming ? <input ref={renameInputRef} value={renameVal} onChange={e => setRenameVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingId(null); }} onBlur={commitRename} style={{ width: "100%", background: C.orangeDim, border: `1px solid ${C.orangeBorder}`, borderRadius: 4, color: "#f1f5f9", fontSize: 11.5, padding: "2px 5px", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                  : <>
                    <div style={{ fontSize: 11.5, color: isActive ? "#f1f5f9" : C.textMid, fontWeight: isActive ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 38, lineHeight: 1.4 }}>{chat.title}</div>
                    <div style={{ fontSize: 9.5, color: C.textFaint, marginTop: 1 }}>{fmtDate(chat.updatedAt)}</div>
                    <div className="cbtn" style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 2, opacity: 0, transition: "opacity 0.12s" }}>
                      <button onClick={e => startRename(e, chat.id, chat.title)} style={{ width: 18, height: 18, borderRadius: 3, background: "rgba(71,85,105,0.5)", border: "none", color: C.textMid, fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✏</button>
                      <button onClick={e => removeChat(e, chat.id)} style={{ width: 18, height: 18, borderRadius: 3, background: "rgba(239,68,68,0.28)", border: "none", color: C.red, fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                    </div>
                  </>}
                </div>
              );
            })}
          </div>
          <div style={{ padding: "8px 10px", borderTop: "1px solid rgba(255,255,255,0.04)", fontSize: 9.5, color: C.textFaint, lineHeight: 1.5, flexShrink: 0 }}>Chats auto-saved · This browser<br />Phoenix Controls · (800) 340-0007</div>
        </div>
      </div>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: C.panel, borderBottom: "1px solid rgba(249,115,22,0.15)", padding: "9px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "rgba(71,85,105,0.12)", border: "1px solid rgba(71,85,105,0.22)", borderRadius: 7, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: C.textDim, flexShrink: 0, transition: "all 0.15s" }} onMouseEnter={e => e.currentTarget.style.color = C.orange} onMouseLeave={e => e.currentTarget.style.color = C.textDim}>{sidebarOpen ? "◀" : "▶"}</button>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #f97316,#c2410c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, boxShadow: "0 0 14px rgba(249,115,22,0.28)" }}>🕵️</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>Ace Venturi: Controls Detective</div>
            <div style={{ fontSize: 9.5, color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.06em" }}>Complete Field Toolkit · 8 Tools · AI Chat · Image Analysis</div>
          </div>
          <div style={{ background: "rgba(34,197,94,0.11)", border: "1px solid rgba(34,197,94,0.24)", borderRadius: 20, padding: "2px 9px", fontSize: 10.5, color: C.green, display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, display: "inline-block" }} />Online
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ background: "rgba(7,13,26,0.98)", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", overflowX: "auto", flexShrink: 0, padding: "0 6px" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ padding: "9px 13px", fontSize: 12, fontWeight: activeTab === t.id ? 600 : 400, color: activeTab === t.id ? C.orange : C.textDim, background: "transparent", border: "none", borderBottom: `2px solid ${activeTab === t.id ? C.orange : "transparent"}`, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s", flexShrink: 0 }}
              onMouseEnter={e => { if (activeTab !== t.id) e.currentTarget.style.color = C.textMid; }}
              onMouseLeave={e => { if (activeTab !== t.id) e.currentTarget.style.color = C.textDim; }}
            ><span style={{ fontSize: 14 }}>{t.icon}</span>{t.label}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* ── CHAT TAB ── */}
          {activeTab === "chat" && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 840, width: "100%", margin: "0 auto", padding: "0 14px", boxSizing: "border-box" }}>
              {messages.length === 0 && (
                <div style={{ padding: "20px 0 8px" }}>
                  <div style={{ background: C.orangeDim, border: `1px solid ${C.orangeBorder}`, borderRadius: 14, padding: "18px 22px", marginBottom: 14 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>Ace Venturi: Controls Detective 🕵️</div>
                    <div style={{ fontSize: 12.5, color: C.textMid, lineHeight: 1.75, marginBottom: 12 }}>On the case for all things Phoenix Controls. Every product, every alarm, every commissioning procedure. Upload any image for instant analysis. Use the tabs above for calculators, checklists, logs, and more.</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {[{ icon: "📷", label: "Image analysis" }, { icon: "📏", label: "Valve sizer" }, { icon: "💨", label: "FV calculator" }, { icon: "🔌", label: "Wiring guide" }, { icon: "✅", label: "Commissioning" }, { icon: "🚨", label: "Alarm log" }, { icon: "🌐", label: "BACnet calc" }, { icon: "🔍", label: "Model decoder" }, { icon: "🗂️", label: "Asset tracker" }].map(c => (
                        <div key={c.label} style={{ background: "rgba(15,23,42,0.85)", border: "1px solid rgba(51,65,85,0.55)", borderRadius: 20, padding: "4px 10px", display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: C.textMid }}><span>{c.icon}</span>{c.label}</div>
                      ))}
                    </div>
                  </div>
                  <div onClick={() => fileInputRef.current?.click()} style={{ background: "rgba(249,115,22,0.04)", border: `2px dashed ${C.orangeBorder}`, borderRadius: 11, padding: "13px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 13, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(249,115,22,0.09)"; e.currentTarget.style.borderColor = "rgba(249,115,22,0.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(249,115,22,0.04)"; e.currentTarget.style.borderColor = C.orangeBorder; }}>
                    <span style={{ fontSize: 26 }}>📷</span>
                    <div><div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>Upload data plate, flowchart, or alarm screen</div><div style={{ fontSize: 11, color: C.textDim }}>Multiple files OK · Click, drag & drop, or paste (Ctrl+V)</div></div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                    {["CSCP/PBC/ACM/FHD500","Celeris","Traccel","Theris","X30 FHM","MIJ/PHX","Accel II","Sentry","Flow Manager","Sash Sensors"].map(s => <span key={s} style={{ background: "rgba(22,33,55,0.85)", border: "1px solid rgba(51,65,85,0.55)", borderRadius: 20, padding: "2px 9px", fontSize: 11, color: C.textDim }}>{s}</span>)}
                  </div>
                  <div style={{ fontSize: 11, color: C.textFaint, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Quick Start</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {QUICK_PROMPTS.map(q => (
                      <button key={q.label} onClick={() => sendMessage(q.text)} style={{ background: "rgba(12,20,38,0.8)", border: "1px solid rgba(51,65,85,0.55)", borderRadius: 10, padding: "8px 11px", textAlign: "left", cursor: "pointer", color: C.textMid, fontSize: 12, lineHeight: 1.4, transition: "all 0.15s", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7 }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(249,115,22,0.4)"; e.currentTarget.style.color = C.text; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(51,65,85,0.55)"; e.currentTarget.style.color = C.textMid; }}
                      ><span style={{ fontSize: 14, flexShrink: 0 }}>{q.icon}</span>{q.label}</button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ flex: 1, paddingTop: messages.length > 0 ? 16 : 0, paddingBottom: 8 }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ marginBottom: 16, display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{ fontSize: 9.5, color: C.textFaint, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, paddingLeft: msg.role === "assistant" ? 4 : 0, paddingRight: msg.role === "user" ? 4 : 0 }}>{msg.role === "user" ? "YOU" : "🕵️ ACE"}</div>
                    <div style={{ maxWidth: "88%", background: msg.role === "user" ? "linear-gradient(135deg, rgba(249,115,22,0.16), rgba(194,65,12,0.11))" : C.card, border: msg.role === "user" ? `1px solid ${C.orangeBorder}` : `1px solid ${C.border}`, borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "11px 15px", fontSize: 13.5, lineHeight: 1.75, color: msg.role === "user" ? "#f1f5f9" : C.text }}>
                      {msg.images && <div style={{ marginBottom: 9 }}><div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{msg.images.map((src, idx) => src && <img key={idx} src={src} alt="" style={{ maxWidth: msg.images.length === 1 ? "100%" : "calc(50% - 3px)", maxHeight: 180, borderRadius: 7, border: "1px solid rgba(249,115,22,0.2)", objectFit: "contain", background: C.bg, display: "block" }} />)}</div><div style={{ fontSize: 10.5, color: "rgba(249,115,22,0.55)", marginTop: 4 }}>📷 {msg.images.length === 1 ? "Image" : `${msg.images.length} images`} submitted</div></div>}
                      {msg.role === "assistant" ? formatMessage(msg.content) : <span>{msg.content}</span>}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
                    <div style={{ maxWidth: "88%" }}>
                      <div style={{ fontSize: 9.5, color: C.textFaint, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, paddingLeft: 4 }}>🕵️ ACE</div>
                      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "14px 14px 14px 4px", padding: "11px 15px", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ display: "flex", gap: 5 }}>{[0,1,2].map(n => <span key={n} style={{ width: 7, height: 7, borderRadius: "50%", background: C.orange, display: "inline-block", animation: `pulse 1.2s ease-in-out ${n*0.2}s infinite` }} />)}</div>
                        <style>{`@keyframes pulse{0%,100%{opacity:0.22;transform:scale(0.8)}50%{opacity:1;transform:scale(1)}}`}</style>
                        {statusMsg && <span style={{ fontSize: 12.5, color: C.textDim, fontStyle: "italic" }}>{statusMsg}</span>}
                      </div>
                    </div>
                  </div>
                )}
                {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.24)", borderRadius: 9, padding: "9px 13px", fontSize: 12.5, color: C.red, marginBottom: 10 }}>⚠ {error}</div>}
                <div ref={chatEndRef} />
              </div>
            </div>
          )}

          {/* ── TOOL TABS ── */}
          {activeTab !== "chat" && (
            <div style={{ maxWidth: 820, width: "100%", margin: "0 auto", padding: "0 14px 20px", boxSizing: "border-box" }}>
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

        {/* Input bar (visible on chat tab) */}
        {activeTab === "chat" && (
          <div style={{ background: "rgba(7,13,26,0.99)", borderTop: "1px solid rgba(255,255,255,0.04)", padding: "8px 14px 12px", flexShrink: 0 }}>
            <div style={{ maxWidth: 840, margin: "0 auto" }}>
              {pendingImages.length > 0 && (
                <div style={{ marginBottom: 7, background: C.card, border: `1px solid ${C.orangeBorder}`, borderRadius: 10, padding: "8px 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: "#f1f5f9" }}>📷 {pendingImages.length} image{pendingImages.length > 1 ? "s" : ""} ready</div>
                    <button onClick={() => setPendingImages([])} style={{ ...ghost, fontSize: 10.5, padding: "2px 7px", color: C.red }}>Clear all</button>
                  </div>
                  <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
                    {pendingImages.map(img => (
                      <div key={img.id} style={{ position: "relative", flexShrink: 0 }}>
                        <img src={img.previewUrl} alt={img.name} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(249,115,22,0.2)", background: C.bg, display: "block" }} />
                        <button onClick={() => setPendingImages(p => p.filter(x => x.id !== img.id))} style={{ position: "absolute", top: -4, right: -4, width: 15, height: 15, borderRadius: "50%", background: "rgba(239,68,68,0.85)", border: "none", color: "#fff", fontSize: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                      </div>
                    ))}
                    <div onClick={() => fileInputRef.current?.click()} style={{ flexShrink: 0, width: 52, height: 52, border: `2px dashed ${C.orangeBorder}`, borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(249,115,22,0.55)"} onMouseLeave={e => e.currentTarget.style.borderColor = C.orangeBorder}>
                      <span style={{ fontSize: 14, color: C.orange }}>+</span><span style={{ fontSize: 8.5, color: C.textDim }}>Add</span>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ background: C.card, border: `1px solid ${dragOver ? "rgba(249,115,22,0.55)" : "rgba(51,65,85,0.6)"}`, borderRadius: 13, display: "flex", alignItems: "flex-end", gap: 7, padding: "7px 9px", boxShadow: "0 0 20px rgba(0,0,0,0.4)" }}>
                <button onClick={() => fileInputRef.current?.click()} style={{ background: C.orangeDim, border: `1px solid ${C.orangeBorder}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.background = "rgba(249,115,22,0.28)"} onMouseLeave={e => e.currentTarget.style.background = C.orangeDim}>📷</button>
                <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                  onPaste={e => { for (const item of (e.clipboardData?.items || [])) { if (item.type.startsWith("image/")) processImageFile(item.getAsFile()); } }}
                  placeholder={pendingImages.length > 0 ? "Add context (optional)…" : "Ask anything about Phoenix Controls, upload images, or use the tool tabs above…"}
                  disabled={loading} rows={1}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#f1f5f9", fontSize: 13.5, resize: "none", lineHeight: 1.6, fontFamily: "inherit", padding: "2px 4px", minHeight: 22, maxHeight: 110, overflowY: "auto" }}
                  onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px"; }}
                />
                <button onClick={() => sendMessage()} disabled={!canSend} style={{ background: canSend ? "linear-gradient(135deg, #f97316,#c2410c)" : "rgba(51,65,85,0.38)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: canSend ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, transition: "all 0.15s", boxShadow: canSend ? "0 0 12px rgba(249,115,22,0.3)" : "none" }}>{loading ? "⏳" : "↑"}</button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={e => { processImageFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
              <div style={{ textAlign: "center", fontSize: 10, color: "#0c1420", marginTop: 5 }}>Phoenix Controls · Honeywell · 75 Discovery Way Acton MA · (800) 340-0007</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
