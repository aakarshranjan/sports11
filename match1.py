# -*- coding: utf-8 -*-
"""
Created on Sat Apr 25 14:50:29 2020

@author: KIIT
"""
import sys
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import seaborn
from scipy.stats import poisson,skellam

epl_1617 = pd.read_csv("final.csv")
epl_1617 = epl_1617[['HomeTeam','AwayTeam','FTHG','FTAG']]
epl_1617 = epl_1617.rename(columns={'FTHG': 'HomeGoals', 'FTAG': 'AwayGoals'})
#print(epl_1617.head())
epl_1617 = epl_1617[:-10]
#print(epl_1617.mean())
#print(skellam.pmf(0.0,  epl_1617.mean()[0],  epl_1617.mean()[1]))
#print(skellam.pmf(1,  epl_1617.mean()[0],  epl_1617.mean()[1]))

import statsmodels.api as sm
import statsmodels.formula.api as smf

goal_model_data = pd.concat([epl_1617[['HomeTeam','AwayTeam','HomeGoals']].assign(home=1).rename(
            columns={'HomeTeam':'team', 'AwayTeam':'opponent','HomeGoals':'goals'}),
           epl_1617[['AwayTeam','HomeTeam','AwayGoals']].assign(home=0).rename(
            columns={'AwayTeam':'team', 'HomeTeam':'opponent','AwayGoals':'goals'})])

poisson_model = smf.glm(formula="goals ~ home + team + opponent", data=goal_model_data, 
                        family=sm.families.Poisson()).fit()
#print(poisson_model.summary())
#print(poisson_model.predict(pd.DataFrame(data={'team': 'Chelsea', 'opponent': 'Sunderland',
 #                                      'home':1},index=[1])))
#print(poisson_model.predict(pd.DataFrame(data={'team': 'Sunderland', 'opponent': 'Chelsea',
 #                                      'home':0},index=[1])))



def simulate_match(foot_model, homeTeam, awayTeam, max_goals=10):
    home_goals_avg = foot_model.predict(pd.DataFrame(data={'team': homeTeam, 
                                                            'opponent': awayTeam,'home':1},
                                                      index=[1])).values[0]
    away_goals_avg = foot_model.predict(pd.DataFrame(data={'team': awayTeam, 
                                                            'opponent': homeTeam,'home':0},
                                                      index=[1])).values[0]
    team_pred = [[poisson.pmf(i, team_avg) for i in range(0, max_goals+1)] for team_avg in [home_goals_avg, away_goals_avg]]
    return(np.outer(np.array(team_pred[0]), np.array(team_pred[1])))
#print(simulate_match(poisson_model, 'Chelsea', 'Sunderland', max_goals=3))

chel_sun = simulate_match(poisson_model, sys.argv[1], sys.argv[2], max_goals=10)
# chelsea win
print(np.sum(np.tril(chel_sun, -1)))

# sunderland win
print("*",np.sum(np.triu(chel_sun, 1)))

# draw
print("*",np.sum(np.diag(chel_sun)))
