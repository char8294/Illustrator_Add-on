# Triple Format Exporter for Adobe Illustrator 2026

Add-on/script นี้ใช้ export ไฟล์ Illustrator ที่เปิดอยู่ให้กลายเป็น 3 ไฟล์ในครั้งเดียว:

- `.ai`
- `.pdf`
- `.png`

สคริปต์จะ save PDF ก่อน, export PNG ต่อ, แล้ว save AI เป็นขั้นสุดท้าย เพื่อให้เอกสารที่เปิดอยู่กลับมาอยู่บนไฟล์ `.ai` หลัง export เสร็จ

## วิธีเร็วที่สุด: รันสคริปต์โดยตรง

1. เปิด Illustrator 2026
2. เปิดไฟล์ที่ต้องการ export
3. ไปที่ `File > Scripts > Other Script...`
4. เลือกไฟล์ `scripts/TripleFormatExporter.jsx` จากโฟลเดอร์นี้
5. เลือกโฟลเดอร์ปลายทาง, ชื่อไฟล์หลัก, และตัวเลือก PNG
6. กด `Export`

ถ้าต้องการให้เมนูนี้ขึ้นถาวรใน `File > Scripts` ให้ copy ไฟล์นี้:

```text
scripts/TripleFormatExporter.jsx
```

ไปไว้ในโฟลเดอร์ Scripts ของ Illustrator เช่น:

```text
C:\Program Files\Adobe\Adobe Illustrator 2026\Presets\en_US\Scripts
```

จากนั้น restart Illustrator

## ติดตั้งเป็น CEP panel

รันไฟล์ PowerShell นี้จากโฟลเดอร์โปรเจกต์:

```powershell
.\Install-CEP-Panel.ps1
```

ถ้า Windows บล็อก execution policy ให้ใช้คำสั่งนี้แทน:

```powershell
powershell -ExecutionPolicy Bypass -File .\Install-CEP-Panel.ps1
```

จากนั้น restart Illustrator แล้วเปิด:

```text
Window > Extensions > Triple Export
```

ตัว installer จะ copy `cep-panel` ไปไว้ที่ user CEP extensions folder และเปิด unsigned CEP panels สำหรับใช้งาน local development

## พฤติกรรมการ export

- ถ้าปิด `Overwrite existing files` แล้วมีไฟล์ชื่อซ้ำอยู่ ระบบจะเติม `_01`, `_02` ต่อท้ายให้อัตโนมัติ
- PNG ใช้ active artboard เป็นค่าเริ่มต้น
- PNG scale เป็นเปอร์เซ็นต์ โดย `100%` คือ export scale ปกติของ Illustrator
- PDF เปิด Illustrator editability ไว้ เพื่อให้เปิดกลับมาแก้ไขได้ง่าย

## Notes

CEP panel เรียก logic export เดียวกับสคริปต์ `.jsx` ถ้า Illustrator รุ่นใหม่ในอนาคตไม่รองรับ CEP แล้ว วิธีรัน `.jsx` โดยตรงจะยังเป็น fallback ที่ปลอดภัยที่สุด
