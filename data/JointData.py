
# coding: utf-8

# In[56]:

import numpy as np
import pandas as pd
import json


# In[34]:

data = pd.read_csv('http://taxbills.nyc/joined.csv',
                   usecols = ['borough', 'ucbbl', '2007uc',
                              '2008uc', '2009uc', '2010uc',
                              '2011uc', '2012uc', '2013uc',
                              '2014uc', 'cd', 'zipcode',
                              'unitsres'])
    
#
# Make a new row for each year
#
mdata = pd.melt(data, id_vars = ['borough', 'ucbbl', 'cd', 'zipcode',
                                 'unitsres'])
mdata.rename(columns = {'variable': 'year',
                        'value': 'Nstabilized'}, inplace = True)
mdata['year'] = mdata.apply(lambda x: np.int64(x.year[0:4]), axis = 1)

    
#
# Get rid of location identifiers that you're not interested in
#     for now
#
mdata.drop(['borough', 'ucbbl', 'cd'], axis = 1,
            inplace = True)
     
mdata = mdata.groupby(['zipcode', 'year']).sum().reset_index()

mdata['Pstabilized'] = mdata['Nstabilized'] / mdata['unitsres']


mdata.drop(['unitsres'], axis = 1, inplace = True)


# In[35]:

mdata.head()


# In[36]:


#
# Drop values with NA zipcodes
#
print(mdata.shape)
mdata.dropna(inplace = True)
print(mdata.shape)
mdata['zipcode'] = mdata['zipcode'].astype(int)
mdata['Nstabilized'] = mdata['Nstabilized'].astype(int)
print(mdata.dtypes)

#
# Save to CSV
#
mdata.to_csv('stabilized.csv', index = False)
  


# In[37]:

mdata.head()


# In[38]:

data = pd.read_csv('311_Heat_Seek_Subset.csv', 
                   usecols = [1, 5, 8], header = None)
data.rename(columns = {1: 'year', 5: 'complaint_type', 8: 'zipcode'}, inplace = True)
data['year'] = data['year'].apply(lambda x: x[6:10])
data = data.groupby(['zipcode', 'year']).count().reset_index()
data.rename(columns = {'complaint_type': 'complaint_count'}, inplace = True)

data['year'] = data['year'].astype(np.int64)
data['zipcode'] = data['zipcode'].astype(np.int64)

data.head()


# In[39]:

print(data.dtypes)
print(mdata.dtypes)


# In[40]:

merge_data = pd.merge(data, mdata, how = 'inner', on = ['zipcode', 'year'])
merge_data.head()


# In[53]:

data = {}

for zc in np.unique(merge_data['zipcode'].values):
    data[zc] = []
    entry = {}
    
    # entry[zc] = []
    hold = merge_data[merge_data.zipcode == zc]
    for ind, row in hold.iterrows():
      entry['year'] = row['year']
      entry['complaint_count'] = row['complaint_count']
      entry['percent_stabilized'] = row['Pstabilized']
      entry['number_stabilized'] = row['Nstabilized']
        
      data[zc].append(entry)


# In[57]:

with open('jointdata2.json', 'w') as f:
    json.dump(data, f)


# In[ ]:



