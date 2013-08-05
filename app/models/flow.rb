class Flow < ActiveRecord::Base
  belongs_to :project
  validates :name, presence: true
  has_many :steps, :class_name => 'FlowStep', :dependent => :destroy

  attr_accessible :name
end
