import matplotlib.pyplot as plt
import numpy as np
import sys
import os

safe_list = ['math', 'arccos', 'arcsin', 'arctan', 'arctan2', 'ceil', 'cos', 'cosh',
'degrees','e', 'exp', 'fabs', 'floor', 'fmod', 'frexp', 'hypot', 'ldexp',
'log', 'log10', 'modf', 'pi', 'power', 'radians', 'sin', 'sinh', 'sqrt', 'tan', 'tanh']
#use the list to filter the local namespace
safe_dict = {k: getattr(np, k) for k in safe_list}
#add any needed builtins back in.
safe_dict['abs'] = abs


[_, filename, dx, dy, minX, maxX, minY, maxY] = sys.argv
[minX, maxX, minY, maxY] = [float(val) for val in [minX, maxX, minY, maxY]]

fig, ax = plt.subplots( nrows=1, ncols=1 )  # create figure & 1 axis

X, Y = np.meshgrid(np.arange(minX, maxX, .5), np.arange(minY, maxY, .5))
safe_dict['x'] = X
safe_dict['y'] = Y

U = eval(dx, {"__builtins__": None}, safe_dict)
V = eval(dy, {"__builtins__": None}, safe_dict)

ax.quiver(X, Y, U, V)
ax.grid()
sys.stdout.flush()

fig.savefig(filename)   # save the figure to file
plt.close(fig)
