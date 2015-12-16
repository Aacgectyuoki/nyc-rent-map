
# coding: utf-8

# In[15]:

import numpy as np
import pandas as pd
import json

raw = pd.read_csv('311withbbls.csv.tar.gz', compression='gzip',
                   usecols = ['Created Date', 'Latitude', 'Longitude', 'bbl', 'Complaint Type'])
raw.head()


# In[28]:

# Take only the year portion of "Created Date"

data = raw.rename(columns = {'Created Date': 'Year'})
data['Year'] = data.apply(lambda x: np.int64(x.Year[6:10]), axis = 1)
data.dropna(inplace = True)
data.head()


# In[34]:

# Group together and count complaints of the same type from the same BBL in the same year

groupby_obj = data[['Year', 'Complaint Type', 'Latitude','Longitude','bbl']].groupby(['Year', 'Complaint Type', 'bbl'])
counted = groupby_obj.agg('mean')    .join(pd.DataFrame(groupby_obj.size(), columns=['Complaints Count']))    .reset_index()
counted.head()


# In[37]:

print (counted.shape)
print (counted.describe())

counted.to_csv('ComplaintCountByBBL.csv', index = False)

