from pathlib import Path
p=Path(r'D:\Projects\NexCart\frontend\host\src\views\HomeView.vue')
s=p.read_text()
lines=s.splitlines()
balance=0
for i,l in enumerate(lines, start=1):
    opens=l.count('<div')
    closes=l.count('</div>')
    balance += opens - closes
    if balance < 0:
        print('Negative balance at line', i)
        break
print('Final balance:', balance)
