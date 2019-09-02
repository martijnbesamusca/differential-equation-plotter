import matplotlib.pyplot as plt
import numpy as np
import sys

MinX = -5
MaxX = 5
MinY = -3
MaxY = 3

fig, ax = plt.subplots( nrows=1, ncols=1 )  # create figure & 1 axis

X, Y = np.meshgrid(np.arange(MinX, MaxX, .1), np.arange(MinY, MaxY, .2))
U = np.cos(X)
V = np.sin(Y)

ax.quiver(X, Y, U, V)

print(f'../comparison/img/{sys.argv[1]}_matplotlib.png')
sys.stdout.flush()

fig.savefig(f'../comparison/img/{sys.argv[1]}_matplotlib.png')   # save the figure to file
plt.close(fig)
