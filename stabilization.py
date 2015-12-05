import pandas as pd

stab = pd.read_csv("data/stabilized_joined.csv")

for y in xrange(2007, 2015):
	stab['noest_{}'.format(y)] = stab["{}uc".format(y)].mask(stab["{}est".format(y)] == "Y")

for y in xrange(2007, 2014):
	ny = y+1
	stab['est_d{}_{}'.format(y,ny)] = stab["{}uc".format(y)] - stab["{}uc".format(ny)]
	stab['noest_d{}_{}'.format(y,ny)] = stab["noest_{}".format(y)] - stab["noest_{}".format(ny)]


for y in xrange(2007, 2014):
    print stab["est_d{}_{}".format(y,y+1)].mean(), "   \t", stab["noest_d{}_{}".format(y,y+1)].mean()

stab["dcum2008"] = stab["noest_d2007_2008"]
for y in xrange(2009, 2015):
	stab["dcum{}".format(y)] = stab["dcum{}".format(y-1)] + stab["noest_d{}_{}".format(y-1, y)]

# for y in xrange(2008, 2015):
# 	per = stab['dcum{}'.format(y)] / stab["unitsres"]
# 	per = per.mask(stab[stab['unitsres'] > 5])
# 	stab["dper{}".format(y)] = per
# 	print y, "\t", per.mean()

